"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      onClick={() => startTransition(() => logoutAction())}
      disabled={pending}
      className={cn("gap-2", className)}
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out..." : "Logout"}
    </Button>
  );
}
