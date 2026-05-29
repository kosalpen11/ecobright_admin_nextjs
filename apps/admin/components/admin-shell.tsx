import Link from "next/link";
import { LayoutGrid, Layers3, Package, ShieldUser, UserCog, Warehouse } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, adminOnly: false },
  { href: "/products", label: "Products", icon: Package, adminOnly: false },
  { href: "/categories", label: "Categories", icon: Layers3, adminOnly: false },
  { href: "/stock", label: "Stock", icon: Warehouse, adminOnly: false },
  { href: "/users", label: "Users", icon: UserCog, adminOnly: true }
];

export async function AdminShell({
  currentPath,
  children
}: {
  currentPath: string;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <ShieldUser className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Admin
                </p>
                <h2 className="text-lg font-semibold text-slate-950">Eco Bright</h2>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Inventory, category mapping, stock audit, and team access in one console.
            </p>
          </div>

          <nav className="mt-10 space-y-1">
            {navigation
              .filter((item) => !item.adminOnly || user?.role === "ADMIN")
              .map((item) => {
                const Icon = item.icon;
                const active = currentPath.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-slate-950 text-white shadow-sm [&_svg]:text-white [&_span]:text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 [&_svg]:text-slate-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </aside>

        <main className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Eco Bright Admin
                </p>
                <p className="text-sm text-slate-600">Operations console</p>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-slate-200 bg-white"
                    >
                      <span className="text-xs font-semibold">
                        {getInitials(user?.name)}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-default flex-col items-start gap-0.5">
                      <span className="font-medium text-slate-900">{user?.name}</span>
                      <span className="text-xs text-slate-500">{user?.role}</span>
                    </DropdownMenuItem>
                    <div className="px-1 pb-1">
                      <LogoutButton className="w-full justify-start" />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
