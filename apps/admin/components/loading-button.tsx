"use client";

import { LoaderCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

export function LoadingButton({
  loading,
  children,
  disabled,
  ...props
}: ButtonProps & { loading?: boolean }) {
  return (
    <Button {...props} disabled={disabled || loading}>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
