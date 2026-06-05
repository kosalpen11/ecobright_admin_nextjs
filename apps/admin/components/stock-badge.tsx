import { StatusBadge } from "@/components/status-badge";

export function StockBadge({
  type
}: {
  type: "IN" | "OUT" | "ADJUSTMENT";
}) {
  if (type === "IN") {
    return <StatusBadge tone="success">IN</StatusBadge>;
  }

  if (type === "OUT") {
    return <StatusBadge tone="destructive">OUT</StatusBadge>;
  }

  return <StatusBadge tone="default">ADJUST</StatusBadge>;
}
