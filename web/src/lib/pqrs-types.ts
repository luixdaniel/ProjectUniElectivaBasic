export type PqrsTipo = "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";

export type PqrsPrioridad = "baja" | "media" | "alta";

export type PqrsItem = {
  id: number;
  numero_radicado: string;
  tipo: PqrsTipo;
  estado: string;
  prioridad: PqrsPrioridad;
  descripcion: string;
  respuesta?: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  categoria?: { id: number; nombre: string };
  usuario?: { id: number; nombre: string; apellido: string; correo?: string };
  responsable?: { id: number; nombre: string; apellido: string; correo?: string } | null;
};

export type HistorialItem = {
  id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario_accion: string;
  comentario: string | null;
  fecha_evento: string;
};
