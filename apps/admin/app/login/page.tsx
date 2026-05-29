import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { LoginForm } from "@/app/login/login-form";
import { Card, CardContent } from "@/components/ui";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md shadow-lg shadow-slate-200/60">
        <CardContent className="space-y-8 p-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-2xl bg-slate-900 p-3 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                Eco Bright Admin
              </h1>
              <p className="text-sm text-slate-500">
                Sign in to manage catalog, stock, and team access.
              </p>
            </div>
          </div>

          <LoginForm />

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Local/dev seed account: <strong>admin@ecobright.local</strong> /{" "}
            <strong>Admin@123456</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
