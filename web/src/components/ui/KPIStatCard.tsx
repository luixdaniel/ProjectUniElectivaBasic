type KPIStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function KPIStatCard({ label, value, hint }: KPIStatCardProps) {
  return (
    <article className="card kpi-card flex flex-col justify-between p-5 h-full !mt-0">
      <p className="muted text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {hint ? <p className="muted mt-1 text-xs">{hint}</p> : null}
    </article>
  );
}
