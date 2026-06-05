"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui";
import { LoadingButton } from "@/components/loading-button";

function MenuActionButton({
  children,
  tone = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "default" | "destructive";
}) {
  return (
    <button
      className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
        tone === "destructive"
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-100"
      } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent`}
      {...props}
    >
      {children}
    </button>
  );
}

export function RowActionMenu({
  title,
  editHref,
  toggleLabel,
  toggleAction,
  toggleFields,
  deleteAction,
  deleteFields,
  deleteDescription,
  deleteDisabled = false,
  deleteDisabledReason
}: {
  title: string;
  editHref: string;
  toggleLabel?: string;
  toggleAction?: (formData: FormData) => void | Promise<void>;
  toggleFields?: Record<string, string>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteFields?: Record<string, string>;
  deleteDescription: string;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  async function runDelete(formData: FormData) {
    if (!deleteAction) {
      return;
    }

    setDeletePending(true);
    try {
      await deleteAction(formData);
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <Link
            href={editHref}
            className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
          >
            Edit
          </Link>
          {toggleAction && toggleLabel ? (
            <ActionForm
              action={toggleAction}
              pendingTitle={toggleLabel}
              pendingDescription="Please wait while the row status is being updated."
            >
              {Object.entries(toggleFields ?? {}).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
              <MenuActionButton type="submit">{toggleLabel}</MenuActionButton>
            </ActionForm>
          ) : null}
          {deleteAction ? (
            <MenuActionButton
              type="button"
              tone="destructive"
              disabled={deleteDisabled}
              title={deleteDisabled ? deleteDisabledReason : undefined}
              onClick={() => {
                if (!deleteDisabled) {
                  setDeleteOpen(true);
                }
              }}
            >
              Delete
            </MenuActionButton>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteAction && !deleteDisabled ? (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{deleteDescription}</DialogDescription>
            </DialogHeader>
            <ActionForm
              action={runDelete}
              pendingTitle="Deleting record"
              pendingDescription="Please wait while the selected row is being removed."
            >
              {Object.entries(deleteFields ?? {}).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <LoadingButton type="submit" variant="destructive" loading={deletePending}>
                  Delete
                </LoadingButton>
              </DialogFooter>
            </ActionForm>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
