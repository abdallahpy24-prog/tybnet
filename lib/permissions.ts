import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminSession = {
  user: {
    id: string;
    role: "ADMIN";
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires?: string;
};

function isAdminSession(session: unknown): session is AdminSession {
  const maybeSession = session as {
    user?: {
      id?: string | null;
      role?: string | null;
    };
  } | null;

  return Boolean(
    maybeSession?.user?.id && maybeSession.user.role === "ADMIN"
  );
}

async function getVerifiedSession() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user?.isActive) {
      return null;
    }

    return {
      ...session,
      user: {
        ...session.user,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error("Session verification error", error);
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getVerifiedSession();

  if (!isAdminSession(session)) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminApi(): Promise<AdminSession> {
  const session = await getVerifiedSession();

  if (!isAdminSession(session)) {
    throw new Error("غير مصرح لك بتنفيذ هذه العملية");
  }

  return session;
}

export async function getCurrentSession() {
  return getVerifiedSession();
}
