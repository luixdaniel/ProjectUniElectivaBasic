type SlaBadgeProps = {
  estado: string;
  fechaCreacion?: string;
};

const CLOSED_STATES = new Set(["respondida", "cerrada", "rechazada"]);

function getDaysSince(dateValue?: string): number {
  if (!dateValue) return 0;
  const source = new Date(dateValue);
  if (Number.isNaN(source.getTime())) return 0;
  const diffMs = Date.now() - source.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function SlaBadge({ estado, fechaCreacion }: SlaBadgeProps) {
  const days = getDaysSince(fechaCreacion);

  let label = "a_tiempo";
  let classes = "bg-emerald-100 text-emerald-800";

  if (!CLOSED_STATES.has(estado)) {
    if (days >= 3) {
      label = "vencida";
      classes = "bg-rose-100 text-rose-800";
    } else if (days >= 2) {
      label = "por_vencer";
      classes = "bg-amber-100 text-amber-800";
    }
  }

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>SLA: {label}</span>;
}
