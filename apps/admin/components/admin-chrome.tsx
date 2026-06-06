"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export function AdminChrome({
  user,
  children
}: {
  user: {
    name?: string | null;
    email?: string | null;
    role?: "ADMIN" | "STAFF";
  } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <Sidebar currentPath={pathname} role={user?.role} />

        <main className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header currentPath={pathname} user={user} />

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
