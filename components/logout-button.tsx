"use client";

import { useTransition } from "react";
import { logoutAction } from "@/lib/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="secondary"
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      disabled={pending}
    >
      {pending ? "Signing out..." : "Logout"}
    </button>
  );
}
