import { LoadingBlock } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="loading-grid">
      <LoadingBlock label="Loading dashboard summary..." />
      <div className="grid dashboard-main-grid">
        <LoadingBlock label="Loading priority queue..." />
        <LoadingBlock label="Loading quick actions..." />
      </div>
      <div className="grid dashboard-main-grid">
        <LoadingBlock label="Loading recent stock activity..." />
        <LoadingBlock label="Loading recent users..." />
      </div>
    </div>
  );
}
