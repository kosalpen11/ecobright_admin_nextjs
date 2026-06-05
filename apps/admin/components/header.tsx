import { getInitials } from "@/lib/format";
import { LogoutButton } from "@/components/logout-button";
import { MobileSidebar } from "@/components/sidebar";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui";

export function Header({
  currentPath,
  user
}: {
  currentPath: string;
  user: {
    name?: string | null;
    email?: string | null;
    role?: "ADMIN" | "STAFF";
  } | null;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <MobileSidebar currentPath={currentPath} role={user?.role} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Eco Bright Admin
            </p>
            <p className="text-sm text-slate-500">Operations dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 bg-white">
                <span className="text-xs font-semibold">{getInitials(user?.name)}</span>
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
  );
}
