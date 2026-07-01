"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  return (
    <form action={formAction} className="grid gap-4">
      <Field label="اسم المستخدم أو البريد">
        <Input name="username" autoComplete="username" required placeholder="admin" />
      </Field>
      <Field label="كلمة المرور">
        <Input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </Field>
      {state?.message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        <LogIn className="h-4 w-4" />
        {pending ? "جاري الدخول" : "دخول"}
      </Button>
    </form>
  );
}
