type StatusBadgeProps = {
  status: string;
};

const STATUS_CLASSES: Record<string, string> = {
  radicada: "bg-slate-100 text-slate-700",
  en_revision: "bg-amber-100 text-amber-800",
  en_gestion: "bg-blue-100 text-blue-800",
  respondida: "bg-emerald-100 text-emerald-800",
  cerrada: "bg-teal-100 text-teal-800",
  rechazada: "bg-rose-100 text-rose-800",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const classes = STATUS_CLASSES[status] ?? "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{status}</span>;
}
