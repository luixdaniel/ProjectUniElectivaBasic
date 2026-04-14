type PqrsTimelineProps = {
  estadoActual: string;
};

const STEPS = ["radicada", "en_revision", "en_gestion", "respondida", "cerrada"];

export default function PqrsTimeline({ estadoActual }: PqrsTimelineProps) {
  const currentIndex = Math.max(STEPS.indexOf(estadoActual), 0);

  return (
    <div className="mt-3 overflow-x-auto">
      <ol className="flex min-w-[680px] items-center gap-2">
        {STEPS.map((step, index) => {
          const done = index <= currentIndex;
          return (
            <li key={step} className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {index + 1}
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wide ${done ? "text-teal-700" : "text-slate-500"}`}>
                {step}
              </span>
              {index < STEPS.length - 1 ? <span className="mx-1 h-px w-10 bg-slate-300" /> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
