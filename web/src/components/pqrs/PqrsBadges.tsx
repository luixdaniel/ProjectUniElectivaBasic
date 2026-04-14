import { PqrsPrioridad, PqrsTipo } from "@/lib/pqrs-types";

type PqrsBadgesProps = {
  tipo: PqrsTipo;
  prioridad: PqrsPrioridad;
  estado: string;
};

export default function PqrsBadges({ tipo, prioridad, estado }: PqrsBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="rounded-full bg-teal-100 px-2 py-1 font-semibold text-teal-800">{tipo}</span>
      <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800">{prioridad}</span>
      <span className="rounded-full bg-slate-200 px-2 py-1 font-semibold text-slate-700">{estado}</span>
    </div>
  );
}
