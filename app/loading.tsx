import { LoadingBlock } from "@/components/ui";

export default function RootLoading() {
  return (
    <div className="auth-page" style={{ alignItems: "start", paddingTop: 48 }}>
      <div className="loading-grid" style={{ width: "min(100%, 1080px)" }}>
        <LoadingBlock label="Loading admin workspace..." />
        <LoadingBlock label="Preparing data..." />
      </div>
    </div>
  );
}
