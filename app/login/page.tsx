import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card stack">
        <div>
          <h1 className="app-title">Eco Bright Admin</h1>
          <p className="muted" style={{ margin: 0 }}>
            Sign in to continue.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
