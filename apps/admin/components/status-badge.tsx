import { Badge } from "@/components/ui";

export function StatusBadge({
  tone = "default",
  children
}: {
  tone?: "default" | "success" | "warning" | "destructive";
  children: React.ReactNode;
}) {
  return <Badge variant={tone}>{children}</Badge>;
}
