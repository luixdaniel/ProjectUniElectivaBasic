"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/layout/DashboardShell";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTableWrapper from "@/components/ui/DataTableWrapper";
import EmptyState from "@/components/ui/EmptyState";
import ExportButtons from "@/components/ui/ExportButtons";
import FilterBar from "@/components/ui/FilterBar";
import PriorityBadge from "@/components/ui/PriorityBadge";
import SearchInput from "@/components/ui/SearchInput";
import StatusBadge from "@/components/ui/StatusBadge";
import PqrsBadges from "@/components/pqrs/PqrsBadges";
import PqrsHistorial from "@/components/pqrs/PqrsHistorial";
import PqrsTimeline from "@/components/pqrs/PqrsTimeline";
import SlaBadge from "@/components/pqrs/SlaBadge";
import { apiRequest } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { HistorialItem, PqrsItem, PqrsPrioridad, PqrsTipo } from "@/lib/pqrs-types";
import { useRoleGuard } from "@/lib/role-guard";

type Categoria = { id: number; nombre: string };

type PqrsResponse = { resultado: PqrsItem[] };
type CatalogoResponse = { resultado: { categorias: Categoria[] } };
type PqrsDetailResponse = { resultado: PqrsItem };
type HistorialResponse = { resultado: HistorialItem[] };

export default function UsuarioPqrsPage() {
  const router = useRouter();
  const { user, token, ready } = useRoleGuard(["usuario"], "/dashboard");

  const [misPqrs, setMisPqrs] = useState<PqrsItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selected, setSelected] = useState<PqrsItem | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);

  const [tipo, setTipo] = useState<PqrsTipo>("peticion");
  const [categoriaId, setCategoriaId] = useState<number>(0);
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<PqrsPrioridad>("media");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<PqrsItem | null>(null);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [prioridadFilter, setPrioridadFilter] = useState("todas");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dashboardHref = "/dashboard/usuario";

  useEffect(() => {
    if (!token || !user || !ready) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [catalogoData, misData] = await Promise.all([
          apiRequest<CatalogoResponse>("/pqrs/catalogo", { token }),
          apiRequest<PqrsResponse>("/pqrs/mis", { token }),
        ]);

        const categories = catalogoData.resultado?.categorias ?? [];
        setCategorias(categories);
        if (categories.length > 0 && categoriaId === 0) {
          setCategoriaId(categories[0].id);
        }

        setMisPqrs(misData.resultado ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar PQRS";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token, user, categoriaId, ready]);

  async function reloadMisPqrs() {
    if (!token) return;
    const data = await apiRequest<PqrsResponse>("/pqrs/mis", { token });
    setMisPqrs(data.resultado ?? []);
  }

  const loadDetalle = useCallback(async (id: number) => {
    if (!token) return;
    setError("");
    try {
      const [detailData, historyData] = await Promise.all([
        apiRequest<PqrsDetailResponse>(`/pqrs/${id}`, { token }),
        apiRequest<HistorialResponse>(`/pqrs/${id}/historial`, { token }),
      ]);
      setSelected(detailData.resultado);
      setHistorial(historyData.resultado ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar detalle";
      setError(message);
    }
  }, [token]);

  async function onCreatePqrs(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (!categoriaId) {
      setError("Selecciona una categoria");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest<{ resultado: { id: number } }>("/pqrs/", {
        method: "POST",
        token,
        body: {
          tipo,
          categoria_id: categoriaId,
          descripcion: descripcion.trim(),
          prioridad,
        },
      });

      setDescripcion("");
      setPrioridad("media");
      setSuccess("PQRS creada correctamente");
      setShowCreateForm(false);
      await reloadMisPqrs();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear PQRS";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function onDeletePqrs(item: PqrsItem) {
    if (!token) return;

    if (!["radicada", "en_revision"].includes(item.estado)) {
      setError("Solo puedes eliminar PQRS en estado radicada o en_revision");
      return;
    }

    setDeletingId(item.id);
    setError("");
    setSuccess("");
    try {
      await apiRequest<{ resultado: string }>(`/pqrs/${item.id}`, {
        method: "DELETE",
        token,
      });

      if (selected?.id === item.id) {
        setSelected(null);
        setHistorial([]);
      }

      setSuccess("PQRS eliminada correctamente");
      await reloadMisPqrs();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar la PQRS";
      setError(message);
    } finally {
      setDeletingId(null);
      setToDelete(null);
    }
  }

  const filteredRows = useMemo(() => {
    return misPqrs.filter((item) => {
      const bySearch =
        item.numero_radicado.toLowerCase().includes(search.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(search.toLowerCase());
      const byEstado = estadoFilter === "todos" || item.estado === estadoFilter;
      const byPrioridad = prioridadFilter === "todas" || item.prioridad === prioridadFilter;
      return bySearch && byEstado && byPrioridad;
    });
  }, [misPqrs, prioridadFilter, search, estadoFilter]);

  const columns = useMemo<ColumnDef<PqrsItem>[]>(
    () => [
      {
        header: "Radicado",
        accessorKey: "numero_radicado",
        cell: ({ row }) => <span className="font-semibold">{row.original.numero_radicado}</span>,
      },
      {
        header: "Tipo",
        accessorKey: "tipo",
      },
      {
        header: "Estado",
        accessorKey: "estado",
        cell: ({ row }) => <StatusBadge status={row.original.estado} />,
      },
      {
        header: "Prioridad",
        accessorKey: "prioridad",
        cell: ({ row }) => <PriorityBadge priority={row.original.prioridad} />,
      },
      {
        header: "SLA",
        id: "sla",
        cell: ({ row }) => <SlaBadge estado={row.original.estado} fechaCreacion={row.original.fecha_creacion} />,
      },
      {
        header: "Acciones",
        id: "acciones",
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original;
          const canDelete = ["radicada", "en_revision"].includes(item.estado);
          return (
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost !text-xs !py-1.5 !px-3" onClick={() => loadDetalle(item.id)}>
                Ver
              </button>
              <button
                className="btn-ghost !text-xs !py-1.5 !px-3"
                onClick={() => setToDelete(item)}
                disabled={!canDelete || deletingId === item.id}
              >
                {deletingId === item.id ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          );
        },
      },
    ],
    [deletingId, loadDetalle]
  );

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  if (!ready) {
    return (
      <main className="py-10">
        <section className="app-shell card p-6">
          <p className="muted">Validando permisos...</p>
        </section>
      </main>
    );
  }

  return (
    <DashboardShell
      roleLabel="Dashboard Usuario"
      title="Mis PQRS"
      subtitle={user ? `${user.nombre} ${user.apellido} | ${user.correo}` : ""}
      links={[
        { href: dashboardHref, label: "Mi Resumen", category: "GENERAL" },
        { href: "/dashboard/usuario/perfil", label: "Mi Perfil", category: "GENERAL" },
        { href: "/pqrs", label: "Gestión de PQRS", category: "ATENCIÓN" },
        { href: "/", label: "Volver a inicio", category: "SISTEMA" },
      ]}
      profileMenuItems={[
        { href: "/dashboard/usuario/perfil", label: "Mi perfil" },
        { href: "/pqrs", label: "Mis PQRS" },
      ]}
      onLogout={handleLogout}
    >
      <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Mis PQRS</h2>
              <p className="muted mt-1 text-sm">Gestiona tus peticiones, quejas, reclamos y sugerencias.</p>
            </div>
            <button
              className="btn-primary"
              type="button"
              onClick={() => setShowCreateForm(true)}
            >
              Crear PQRS
            </button>
          </div>

          <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Crear Nueva PQRS">
            <form className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onCreatePqrs}>
              <div>
                <label className="mb-1 block text-sm font-medium">Tipo</label>
                <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as PqrsTipo)}>
                  <option value="peticion">Petición</option>
                  <option value="queja">Queja</option>
                  <option value="reclamo">Reclamo</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="felicitacion">Felicitación</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Categoria</label>
                <select className="input" value={categoriaId || ""} onChange={(e) => setCategoriaId(Number(e.target.value))}>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Prioridad</label>
                <select className="input" value={prioridad} onChange={(e) => setPrioridad(e.target.value as PqrsPrioridad)}>
                  <option value="baja">baja</option>
                  <option value="media">media</option>
                  <option value="alta">alta</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Descripcion</label>
                <textarea className="input min-h-24" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
              </div>

              <div className="md:col-span-2 flex flex-wrap justify-end gap-2 mt-4">
                <button className="btn-ghost" type="button" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </button>
                <button className="btn-primary" type="submit" disabled={saving || loading}>
                  {saving ? "Guardando..." : "Guardar PQRS"}
                </button>
              </div>
            </form>
          </Modal>
      </section>

      <section className="card p-6">
          <h2 className="text-xl font-semibold">Listado</h2>
          {loading ? <p className="muted mt-3">Cargando...</p> : null}
          {error ? <p className="error-text mt-3">{error}</p> : null}
          {success ? <p className="mt-3 rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{success}</p> : null}

          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por radicado o descripcion" />
            <select className="input" value={estadoFilter} onChange={(event) => setEstadoFilter(event.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="radicada">radicada</option>
              <option value="en_revision">en_revision</option>
              <option value="en_gestion">en_gestion</option>
              <option value="respondida">respondida</option>
              <option value="cerrada">cerrada</option>
              <option value="rechazada">rechazada</option>
            </select>
            <select className="input" value={prioridadFilter} onChange={(event) => setPrioridadFilter(event.target.value)}>
              <option value="todas">Todas las prioridades</option>
              <option value="baja">baja</option>
              <option value="media">media</option>
              <option value="alta">alta</option>
            </select>
            <ExportButtons
              fileName="mis-pqrs"
              rows={filteredRows.map((item) => ({
                radicado: item.numero_radicado,
                estado: item.estado,
                prioridad: item.prioridad,
                tipo: item.tipo,
              }))}
              columns={[
                { key: "radicado", label: "Radicado" },
                { key: "estado", label: "Estado" },
                { key: "prioridad", label: "Prioridad" },
                { key: "tipo", label: "Tipo" },
              ]}
            />
          </FilterBar>

          {!loading && filteredRows.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Sin resultados" subtitle="Ajusta filtros o crea una nueva PQRS." />
            </div>
          ) : (
            <div className="mt-4">
              <DataTableWrapper data={filteredRows} columns={columns} title="Mis PQRS" searchPlaceholder="Buscar en la tabla" />
            </div>
          )}
      </section>

      {selected && (
        <section className="card p-6">
            <h2 className="text-xl font-semibold">Detalle</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <PqrsBadges tipo={selected.tipo} prioridad={selected.prioridad} estado={selected.estado} />
              <SlaBadge estado={selected.estado} fechaCreacion={selected.fecha_creacion} />
            </div>
            <p className="mt-1 text-sm font-medium">{selected.numero_radicado}</p>
            <p className="muted mt-1 text-sm">{selected.descripcion}</p>
            <p className="muted mt-1 text-sm">Categoria: {selected.categoria?.nombre ?? "Sin categoria"}</p>
            <p className="muted mt-1 text-sm">Estado: {selected.estado}</p>
            <PqrsTimeline estadoActual={selected.estado} />
            {selected.respuesta ? <p className="mt-2 rounded-md bg-sky-100 px-3 py-2 text-sm text-sky-900">Respuesta: {selected.respuesta}</p> : null}
            <PqrsHistorial items={historial} />
        </section>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar PQRS"
        message={toDelete ? `Esta accion eliminara la PQRS ${toDelete.numero_radicado}.` : ""}
        confirmText="Eliminar"
        loading={deletingId !== null}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) void onDeletePqrs(toDelete);
        }}
      />
    </DashboardShell>
  );
}
