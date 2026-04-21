"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/layout/DashboardShell";
import DataTableWrapper from "@/components/ui/DataTableWrapper";
import EmptyState from "@/components/ui/EmptyState";
import KPIStatCard from "@/components/ui/KPIStatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { API_URL, apiRequest } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { PqrsItem } from "@/lib/pqrs-types";
import { useRoleGuard } from "@/lib/role-guard";

type PqrsResponse = { resultado: PqrsItem[] };
type AdminUser = {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  rol: "usuario" | "responsable" | "admin";
};
type UsersResponse = { resultado: AdminUser[] };

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, ready } = useRoleGuard(["admin"], "/dashboard/usuario");
  const [items, setItems] = useState<PqrsItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [edad, setEdad] = useState(25);
  const [usuarioNew, setUsuarioNew] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    if (!token || !ready) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [pqrsData, usersData] = await Promise.all([
          apiRequest<PqrsResponse>("/pqrs/asignadas", { token }),
          apiRequest<UsersResponse>("/get_users/", { token }),
        ]);
        setItems(pqrsData.resultado ?? []);
        setUsers(usersData.resultado ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar el panel admin";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token, ready]);

  const metrics = useMemo(() => {
    const total = items.length;
    const abiertas = items.filter((item) => ["radicada", "en_revision", "en_gestion"].includes(item.estado)).length;
    const respondidas = items.filter((item) => item.estado === "respondida").length;
    const cerradas = items.filter((item) => ["cerrada", "rechazada"].includes(item.estado)).length;
    const responsables = users.filter((item) => item.rol === "responsable").length;
    return { total, abiertas, respondidas, cerradas, responsables };
  }, [items, users]);

  const userColumns: ColumnDef<AdminUser>[] = [
      {
        header: "Nombre",
        id: "nombre_completo",
        cell: ({ row }) => `${row.original.nombre} ${row.original.apellido}`,
      },
      {
        header: "Usuario",
        accessorKey: "usuario",
      },
      {
        header: "Correo",
        accessorKey: "correo",
      },
      {
        header: "Rol",
        accessorKey: "rol",
        cell: ({ row }) => <StatusBadge status={row.original.rol} />,
      },
      {
        header: "Acciones",
        id: "acciones",
        enableSorting: false,
        cell: ({ row }) => {
          const rowUser = row.original;
          const isAdminRow = rowUser.rol === "admin";
          const isLoading = actionLoadingId === rowUser.id;
          return (
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-ghost !text-xs !py-1.5 !px-3"
                onClick={() => {
                  void onToggleResponsable(rowUser);
                }}
                disabled={isAdminRow || isLoading}
              >
                {rowUser.rol === "responsable" ? "Desactivar" : "Activar"}
              </button>
              <button
                className="btn-ghost !text-xs !py-1.5 !px-3"
                onClick={() => {
                  void onResetPassword(rowUser);
                }}
                disabled={isAdminRow || isLoading}
              >
                Reset clave
              </button>
              <button
                className="btn-ghost !text-xs !py-1.5 !px-3"
                onClick={() => {
                  void onDeleteUser(rowUser);
                }}
                disabled={isAdminRow || isLoading}
              >
                Eliminar
              </button>
            </div>
          );
        },
      },
    ];

  async function refreshUsers() {
    if (!token) return;
    const usersData = await apiRequest<UsersResponse>("/get_users/", { token });
    setUsers(usersData.resultado ?? []);
  }

  async function onCreateResponsable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest<{ resultado: string }>("/create_user", {
        method: "POST",
        token,
        body: {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          cedula: cedula.trim(),
          edad,
          usuario: usuarioNew.trim(),
          correo: correo.trim().toLowerCase(),
          contrasena,
          rol: "responsable",
        },
      });

      setNombre("");
      setApellido("");
      setCedula("");
      setEdad(25);
      setUsuarioNew("");
      setCorreo("");
      setContrasena("");
      setSuccess("Responsable creado correctamente");
      await refreshUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el responsable";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function onToggleResponsable(targetUser: AdminUser) {
    if (!token) return;
    if (targetUser.rol === "admin") return;

    const activar = targetUser.rol !== "responsable";
    const confirmMessage = activar
      ? `¿Activar como responsable a ${targetUser.usuario}?`
      : `¿Desactivar responsable ${targetUser.usuario}?`;

    if (!window.confirm(confirmMessage)) return;

    setActionLoadingId(targetUser.id);
    setError("");
    setSuccess("");
    try {
      await apiRequest<{ resultado: string }>(`/users/${targetUser.id}/responsable-status`, {
        method: "PATCH",
        token,
        body: { activo: activar },
      });
      setSuccess(activar ? "Responsable activado" : "Responsable desactivado");
      await refreshUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el rol";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function onResetPassword(targetUser: AdminUser) {
    if (!token) return;
    if (targetUser.rol === "admin") return;

    const newPassword = window.prompt(`Nueva contraseña para ${targetUser.usuario} (min 6 caracteres):`);
    if (!newPassword) return;

    setActionLoadingId(targetUser.id);
    setError("");
    setSuccess("");
    try {
      await apiRequest<{ resultado: string }>(`/users/${targetUser.id}/reset-password`, {
        method: "PATCH",
        token,
        body: { nueva_contrasena: newPassword },
      });
      setSuccess("Contraseña restablecida correctamente");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo restablecer la contraseña";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function onDeleteUser(targetUser: AdminUser) {
    if (!token) return;
    if (targetUser.rol === "admin") return;

    const confirmed = window.confirm(`¿Eliminar el usuario ${targetUser.usuario}? Esta acción también elimina sus PQRS creadas.`);
    if (!confirmed) return;

    setActionLoadingId(targetUser.id);
    setError("");
    setSuccess("");
    try {
      await apiRequest<{ resultado: string }>(`/admin/users/${targetUser.id}`, {
        method: "DELETE",
        token,
      });
      setSuccess("Usuario eliminado correctamente");
      await refreshUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el usuario";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function onDownloadExcelPowerBI() {
    if (!token) return;

    setDownloadingExcel(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/pqrs/export/powerbi`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo descargar el archivo`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pqrs_powerbi_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Excel descargado correctamente");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo descargar el Excel";
      setError(message);
    } finally {
      setDownloadingExcel(false);
    }
  }

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
      roleLabel="Dashboard Admin"
      title="Control general PQRS"
      subtitle={user ? `${user.nombre} ${user.apellido} | ${user.correo}` : ""}
      links={[
        { href: "/dashboard/admin", label: "Control general", category: "DASHBOARD" },
        { href: "/dashboard/admin/analytics", label: "Analítica detallada", category: "REPORTES" },
        { href: "/dashboard/responsable", label: "Panel Responsables", category: "VISORES" },
        { href: "/", label: "Regresar al sitio", category: "SISTEMA" },
      ]}
      onLogout={handleLogout}
    >
      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <KPIStatCard label="Total" value={metrics.total} />
          <KPIStatCard label="Abiertas" value={metrics.abiertas} />
          <KPIStatCard label="Respondidas" value={metrics.respondidas} />
          <KPIStatCard label="Cerradas/Rechazadas" value={metrics.cerradas} />
      </section>

      <section className="mb-6 card p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Exportar datos para Power BI</h2>
            <p className="muted mt-1 text-sm">Descarga todos los datos de PQRS en formato Excel para importar a Power BI</p>
          </div>
          <button
            className="btn-primary w-fit"
            type="button"
            onClick={onDownloadExcelPowerBI}
            disabled={downloadingExcel}
          >
            {downloadingExcel ? "Descargando..." : "📊 Descargar Excel para Power BI"}
          </button>
          {success && success.includes("Excel") && (
            <p className="rounded bg-green-50 p-3 text-sm text-green-700">{success}</p>
          )}
        </div>
      </section>

      <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Gestion de responsables</h2>
              <p className="muted mt-1 text-sm">Responsables actuales: {metrics.responsables}</p>
            </div>
            <button
              className="btn-primary"
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm ? "Ocultar formulario" : "Crear responsable"}
            </button>
          </div>

          {showCreateForm ? (
            <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onCreateResponsable}>
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre</label>
                <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Apellido</label>
                <input className="input" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Cedula</label>
                <input className="input" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Edad</label>
                <input className="input" type="number" min={18} max={100} value={edad} onChange={(e) => setEdad(Number(e.target.value))} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Usuario</label>
                <input className="input" value={usuarioNew} onChange={(e) => setUsuarioNew(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Correo</label>
                <input className="input" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Contrasena temporal</label>
                <input className="input" type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-2 pt-2">
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? "Creando..." : "Guardar responsable"}
                </button>
                <button className="btn-ghost" type="button" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : null}

          {success ? <p className="mt-4 rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{success}</p> : null}
          {error ? <p className="error-text mt-4">{error}</p> : null}
      </section>

      <section className="card p-6">
          <h2 className="text-xl font-semibold">Usuarios y roles</h2>
          <p className="muted mt-1 text-sm">Tabla administrativa con busqueda y paginacion.</p>

          {users.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Sin usuarios para mostrar" subtitle="No hay registros creados." />
            </div>
          ) : (
            <div className="mt-4">
              <DataTableWrapper data={users} columns={userColumns} title="Listado de usuarios" searchPlaceholder="Buscar por nombre, correo o rol..." />
            </div>
          )}
      </section>

      <section className="card p-6">
          <h2 className="text-xl font-semibold">Acciones rapidas</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard/responsable" className="btn-primary">Gestionar bandeja</Link>
            <Link href="/dashboard/admin/analytics" className="btn-ghost">Ver analitica</Link>
            <Link href="/" className="btn-ghost">Ir al inicio</Link>
          </div>

          {loading ? <p className="muted mt-4">Cargando metricas...</p> : null}
          {error ? <p className="error-text mt-4">{error}</p> : null}
      </section>
    </DashboardShell>
  );
}
