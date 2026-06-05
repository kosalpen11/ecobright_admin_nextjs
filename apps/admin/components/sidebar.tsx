"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutGrid,
  Layers3,
  Menu,
  Package,
  ShieldUser,
  UserCog,
  Warehouse,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

export const adminNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Layers3 },
  { href: "/stock", label: "Stock", icon: Warehouse },
  { href: "/users", label: "Users", icon: UserCog, adminOnly: true }
];

function SidebarContent({
  currentPath,
  role,
  onNavigate
}: {
  currentPath: string;
  role?: "ADMIN" | "STAFF";
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-sm">
            <ShieldUser className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Admin
            </p>
            <h2 className="text-lg font-semibold text-slate-950">Eco Bright</h2>
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-500">
          Inventory, pricing, stock audit, and team access in one console.
        </p>
      </div>

      <nav className="mt-8 space-y-1.5">
        {adminNavigation
          .filter((item) => !item.adminOnly || role === "ADMIN")
          .map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-500")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}

export function Sidebar({
  currentPath,
  role
}: {
  currentPath: string;
  role?: "ADMIN" | "STAFF";
}) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col">
      <SidebarContent currentPath={currentPath} role={role} />
    </aside>
  );
}

export function MobileSidebar({
  currentPath,
  role
}: {
  currentPath: string;
  role?: "ADMIN" | "STAFF";
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 flex h-dvh max-w-[320px] translate-x-0 translate-y-0 rounded-none border-r border-slate-200 p-0">
        <div className="flex h-full flex-col bg-white px-6 py-6">
          <div className="mb-6 flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">Navigation</DialogTitle>
            <Button variant="outline" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent currentPath={currentPath} role={role} onNavigate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
