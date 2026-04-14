"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import PqrsBadges from "@/components/pqrs/PqrsBadges";
import PqrsHistorial from "@/components/pqrs/PqrsHistorial";
import { apiRequest } from "@/lib/api";
import { AuthUser, clearSession, getToken, getUser } from "@/lib/auth";
import { HistorialItem, PqrsItem, PqrsPrioridad, PqrsTipo } from "@/lib/pqrs-types";

type Categoria = { id: number; nombre: string };

type PqrsResponse = { resultado: PqrsItem[] };
type CatalogoResponse = { resultado: { categorias: Categoria[] } };
type PqrsDetailResponse = { resultado: PqrsItem };
type HistorialResponse = { resultado: HistorialItem[] };

export default function UsuarioPqrsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [misPqrs, setMisPqrs] = useState<PqrsItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selected, setSelected] = useState<PqrsItem | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);

  const [tipo, setTipo] = useState<PqrsTipo>("P");
  const [categoriaId, setCategoriaId] = useState<number>(0);
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<PqrsPrioridad>("media");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dashboardHref = user?.rol === "admin" ? "/dashboard/admin" : user?.rol === "responsable" ? "/dashboard/responsable" : "/dashboard/usuario";

  useEffect(() => {
    const currentToken = getToken();
    const currentUser = getUser();

    if (!currentToken || !currentUser) {
      router.replace("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      setToken(currentToken);
      setUser(currentUser);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!token || !user) return;

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
  }, [token, user, categoriaId]);

  async function reloadMisPqrs() {
    if (!token) return;
    const data = await apiRequest<PqrsResponse>("/pqrs/mis", { token });
    setMisPqrs(data.resultado ?? []);
  }

  async function loadDetalle(id: number) {
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
  }

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
      await reloadMisPqrs();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear PQRS";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  return (
    <main className="py-10">
      <section className="app-shell">
        <header className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-teal-700">Modulo Usuario</p>
            <h1 className="text-2xl font-bold">Mis PQRS</h1>
            {user ? (
              <p className="muted mt-1 text-sm">
                {user.nombre} {user.apellido} | {user.correo}
              </p>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Link href={dashboardHref} className="btn-ghost">
              Dashboard
            </Link>
            {(user?.rol === "responsable" || user?.rol === "admin") && (
              <Link href="/responsable" className="btn-ghost">
                Bandeja responsable
              </Link>
            )}
            <button className="btn-primary" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>
        </header>

        <section className="card mt-6 p-6">
          <h2 className="text-xl font-semibold">Crear PQRS</h2>
          <p className="muted mt-1 text-sm">Radica peticion, queja, reclamo o sugerencia.</p>

          <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onCreatePqrs}>
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo</label>
              <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as PqrsTipo)}>
                <option value="P">P</option>
                <option value="Q">Q</option>
                <option value="R">R</option>
                <option value="S">S</option>
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

            <button className="btn-primary md:col-span-2" type="submit" disabled={saving || loading}>
              {saving ? "Guardando..." : "Crear PQRS"}
            </button>
          </form>
        </section>

        <section className="card mt-6 p-6">
          <h2 className="text-xl font-semibold">Listado</h2>
          {loading ? <p className="muted mt-3">Cargando...</p> : null}
          {error ? <p className="error-text mt-3">{error}</p> : null}
          {success ? <p className="mt-3 rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{success}</p> : null}

          {!loading && misPqrs.length === 0 ? <p className="muted mt-3">Aun no tienes PQRS.</p> : null}

          <div className="mt-4 space-y-3">
            {misPqrs.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <PqrsBadges tipo={item.tipo} prioridad={item.prioridad} estado={item.estado} />
                <p className="mt-2 font-semibold">{item.numero_radicado}</p>
                <p className="muted mt-1 text-sm line-clamp-2">{item.descripcion}</p>
                <button className="btn-ghost mt-3" onClick={() => loadDetalle(item.id)}>
                  Ver detalle
                </button>
              </article>
            ))}
          </div>
        </section>

        {selected && (
          <section className="card mt-6 p-6">
            <h2 className="text-xl font-semibold">Detalle</h2>
            <p className="mt-1 text-sm font-medium">{selected.numero_radicado}</p>
            <p className="muted mt-1 text-sm">{selected.descripcion}</p>
            <p className="muted mt-1 text-sm">Categoria: {selected.categoria?.nombre ?? "Sin categoria"}</p>
            <p className="muted mt-1 text-sm">Estado: {selected.estado}</p>
            {selected.respuesta ? <p className="mt-2 rounded-md bg-sky-100 px-3 py-2 text-sm text-sky-900">Respuesta: {selected.respuesta}</p> : null}
            <PqrsHistorial items={historial} />
          </section>
        )}
      </section>
    </main>
  );
}
