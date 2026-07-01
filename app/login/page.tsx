import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <Image src="/assets/logo.png" alt="طب نت" width={92} height={88} className="mx-auto h-20 w-20 object-contain" />
          <h1 className="mt-4 text-2xl font-black text-navy">تسجيل دخول الأدمن</h1>
          <p className="mt-2 text-sm text-slate-500">لوحة إدارة منصة طب نت</p>
        </div>
        <LoginForm />
        <Link href="/" className="mt-6 block text-center text-sm font-bold text-primary-dark">العودة للرئيسية</Link>
      </Card>
    </main>
  );
}
