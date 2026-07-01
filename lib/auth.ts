import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
      async authorize(credentials) {
        try {
          const rawLogin = String(credentials?.username ?? "").trim();
          const password = String(credentials?.password ?? "");

          if (!rawLogin || !password) {
            return null;
          }

          const login = rawLogin.toLowerCase();

          const user = await prisma.user.findFirst({
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
            }
          });

          if (!user) {
            return null;
          }

          const passwordIsValid = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!passwordIsValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
        } catch {
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