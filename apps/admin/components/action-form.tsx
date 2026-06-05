"use client";

import { forwardRef, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

function FormPendingDialog({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">
              {description ?? "Please wait while your changes are being processed."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ActionForm = forwardRef<
  HTMLFormElement,
  {
    action: (formData: FormData) => void | Promise<void>;
    className?: string;
    pendingTitle?: string;
    pendingDescription?: string;
    children: ReactNode;
  }
>(function ActionForm(
  {
    action,
    className,
    pendingTitle = "Saving changes",
    pendingDescription,
    children
  },
  ref
) {
  return (
    <form ref={ref} action={action} className={className}>
      <FormPendingDialog title={pendingTitle} description={pendingDescription} />
      {children}
    </form>
  );
});
