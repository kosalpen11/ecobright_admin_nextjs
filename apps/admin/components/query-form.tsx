"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function QueryForm({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className={cn(className, isPending && "pointer-events-none opacity-80")}
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
          const normalized = typeof value === "string" ? value.trim() : "";

          if (normalized) {
            params.set(key, normalized);
          }
        }

        const href = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;

        startTransition(() => {
          router.replace(href, { scroll: false });
        });
      }}
    >
      {children}
    </form>
  );
}
