"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function loginAction(_prevState: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/admin"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "بيانات الدخول غير صحيحة" };
    }
    throw error;
  }

  redirect("/admin");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
