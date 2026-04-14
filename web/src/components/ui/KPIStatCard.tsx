type KPIStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function KPIStatCard({ label, value, hint }: KPIStatCardProps) {
  return (
    <article className="card kpi-card p-5">
      <p className="muted text-sm">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {hint ? <p className="muted mt-1 text-xs">{hint}</p> : null}
    </article>
  );
}
