import { LoadingBlock } from "@/components/ui";

export default function UsersLoading() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)" }}>
      <LoadingBlock label="Loading user form..." />
      <LoadingBlock label="Loading users..." />
    </div>
  );
}
