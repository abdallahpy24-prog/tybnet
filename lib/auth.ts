import { createHash } from "node:crypto";

import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const MAX_CLIENT_FAILURES = 20;

// Used only to keep password-check timing similar when the account does not exist.
const DUMMY_PASSWORD_HASH =
  "$2b$12$NBBaQfIOj5QxV5lXnbFOKOjZUVlU1Hiu0wQpuK1lblWnsTcZu6ZN.";

function readClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwardedIp ||
    null
  );
}

function hashLoginValue(scope: string, value: string) {
  const salt =
    process.env.AUTH_SECRET ||
    process.env.PUBLIC_SITE_URL ||
    "tybnet-login-protection";

  return createHash("sha256")
    .update(`${salt}|${scope}|${value}`)
    .digest("hex");
}

async function authorizeAdmin(
  rawLogin: string,
  password: string,
  request: Request
) {
  const login = rawLogin.toLowerCase();
  const clientIp = readClientIp(request);
  const loginHash = hashLoginValue("login", login);
  const clientHash = clientIp
    ? hashLoginValue("client", clientIp)
    : null;

  return prisma.$transaction(
    async (tx) => {
      const lockKeys = [
        `auth-login:${loginHash}`,
        clientHash ? `auth-client:${clientHash}` : null
      ]
        .filter((value): value is string => Boolean(value))
        .sort();

      for (const lockKey of lockKeys) {
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))
        `;
      }

      const windowStart = new Date(Date.now() - LOGIN_WINDOW_MS);

      const loginRows = await tx.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::int AS "count"
        FROM "AuditLog"
        WHERE "action" = 'admin-login-failed'
          AND "entity" = 'Auth'
          AND "createdAt" >= ${windowStart}
          AND "afterJson"->>'loginHash' = ${loginHash}
      `;

      let clientFailures = 0;

      if (clientHash) {
        const clientRows = await tx.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(*)::int AS "count"
          FROM "AuditLog"
          WHERE "action" = 'admin-login-failed'
            AND "entity" = 'Auth'
            AND "createdAt" >= ${windowStart}
            AND "afterJson"->>'clientHash' = ${clientHash}
        `;

        clientFailures = clientRows[0]?.count ?? 0;
      }

      const loginFailures = loginRows[0]?.count ?? 0;

      if (
        loginFailures >= MAX_LOGIN_FAILURES ||
        clientFailures >= MAX_CLIENT_FAILURES
      ) {
        return null;
      }

      const user = await tx.user.findFirst({
        where: {
          isActive: true,
          OR: [
            {
              username: login
            },
            {
              email: login
            }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          passwordHash: true
        }
      });

      const passwordIsValid = await bcrypt.compare(
        password,
        user?.passwordHash ?? DUMMY_PASSWORD_HASH
      );

      if (!user || !passwordIsValid) {
        await tx.auditLog.create({
          data: {
            userId: null,
            action: "admin-login-failed",
            entity: "Auth",
            entityId: null,
            afterJson: {
              loginHash,
              clientHash
            }
          }
        });

        return null;
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "admin-login-success",
          entity: "Auth",
          entityId: user.id,
          afterJson: {
            clientHash
          }
        }
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    },
    {
      maxWait: 5000,
      timeout: 10000
    }
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: {
          label: "اسم المستخدم أو البريد",
          type: "text"
        },
        password: {
          label: "كلمة المرور",
          type: "password"
        }
      },
      async authorize(credentials, request) {
        try {
          const rawLogin = String(credentials?.username ?? "").trim();
          const password = String(credentials?.password ?? "");

          if (!rawLogin || !password) {
            return null;
          }

          return await authorizeAdmin(rawLogin, password, request);
        } catch (error) {
          console.error("Admin authorization error", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = String(token.role ?? "ADMIN");
      }

      return session;
    }
  }
});
