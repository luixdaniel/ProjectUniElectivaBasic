type EmptyStateProps = {
  title: string;
  subtitle?: string;
};

export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      {subtitle ? <p className="muted mt-1 text-sm">{subtitle}</p> : null}
    </div>
  );
}
