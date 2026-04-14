type PriorityBadgeProps = {
  priority: string;
};

const PRIORITY_CLASSES: Record<string, string> = {
  baja: "bg-emerald-100 text-emerald-800",
  media: "bg-amber-100 text-amber-800",
  alta: "bg-rose-100 text-rose-800",
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const classes = PRIORITY_CLASSES[priority] ?? "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{priority}</span>;
}
