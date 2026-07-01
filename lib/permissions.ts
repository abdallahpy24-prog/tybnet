import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
    maybeSession?.user?.id &&
      maybeSession.user.role === "ADMIN"
  );
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await auth();

  if (!isAdminSession(session)) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminApi(): Promise<AdminSession> {
  const session = await auth();

  if (!isAdminSession(session)) {
    throw new Error("غير مصرح لك بتنفيذ هذه العملية");
  }

  return session;
}

export async function getCurrentSession() {
  return auth();
}