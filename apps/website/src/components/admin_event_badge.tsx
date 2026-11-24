import type { EventVisibility } from "@/lib/admin-dashboard";

const colors: Record<EventVisibility, string> = {
  Visible: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Scheduled: "border-blue-200 bg-blue-50 text-blue-800",
  Draft: "border-zinc-200 bg-zinc-100 text-zinc-700",
  Expired: "border-zinc-200 bg-white text-zinc-500",
};

export function EventVisibilityBadge({ status }: { status: EventVisibility }) {
  return <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium ${colors[status]}`}>{status}</span>;
}
