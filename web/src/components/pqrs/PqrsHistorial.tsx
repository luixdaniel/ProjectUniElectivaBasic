import { HistorialItem } from "@/lib/pqrs-types";

type PqrsHistorialProps = {
  items: HistorialItem[];
  title?: string;
};

export default function PqrsHistorial({ items, title = "Historial de trazabilidad" }: PqrsHistorialProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {items.length === 0 ? <p className="muted mt-2 text-sm">Sin eventos registrados.</p> : null}
      <div className="mt-3 space-y-2">
        {items.map((evento) => (
          <article key={evento.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="font-medium">
              {evento.estado_anterior ?? "sin estado"} -&gt; {evento.estado_nuevo}
            </p>
            <p className="muted">{evento.usuario_accion}</p>
            {evento.comentario ? <p className="muted">{evento.comentario}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
