"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ActionForm } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

function SubmitButton({
  variant = "destructive",
  label
}: {
  variant?: "destructive" | "default" | "outline" | "secondary";
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? "Working..." : label}
    </Button>
  );
}

export function ConfirmDialogForm({
  triggerLabel,
  title,
  description,
  action,
  hiddenFields,
  confirmLabel = "Confirm",
  triggerVariant = "destructive",
  confirmVariant = "destructive"
}: {
  triggerLabel: string;
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
  confirmLabel?: string;
  triggerVariant?: "destructive" | "default" | "outline" | "secondary";
  confirmVariant?: "destructive" | "default" | "outline" | "secondary";
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ActionForm
          action={action}
          pendingTitle={confirmLabel}
          pendingDescription="Please wait while the requested change is being applied."
        >
          {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton label={confirmLabel} variant={confirmVariant} />
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
