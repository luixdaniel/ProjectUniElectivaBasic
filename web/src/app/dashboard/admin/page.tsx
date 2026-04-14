"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/layout/DashboardShell";
import DataTableWrapper from "@/components/ui/DataTableWrapper";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar from "@/components/ui/FilterBar";
import KPIStatCard from "@/components/ui/KPIStatCard";
import SearchInput from "@/components/ui/SearchInput";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api";
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
  const [searchUser, setSearchUser] = useState("");

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

  const usersFiltered = useMemo(() => {
    return users.filter((item) => {
      const term = searchUser.toLowerCase();
      return (
        item.nombre.toLowerCase().includes(term) ||
        item.apellido.toLowerCase().includes(term) ||
        item.usuario.toLowerCase().includes(term) ||
        item.correo.toLowerCase().includes(term) ||
        item.rol.toLowerCase().includes(term)
      );
    });
  }, [searchUser, users]);

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
                className="btn-ghost"
                onClick={() => {
                  void onToggleResponsable(rowUser);
                }}
                disabled={isAdminRow || isLoading}
              >
                {rowUser.rol === "responsable" ? "Desactivar" : "Activar"}
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  void onResetPassword(rowUser);
                }}
                disabled={isAdminRow || isLoading}
              >
                Reset clave
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
        { href: "/dashboard/admin", label: "Inicio admin" },
        { href: "/dashboard/admin/analytics", label: "Analitica" },
        { href: "/dashboard/responsable", label: "Vista responsable" },
        { href: "/", label: "Home" },
      ]}
      onLogout={handleLogout}
    >
      <section className="grid gap-4 md:grid-cols-4">
          <KPIStatCard label="Total" value={metrics.total} />
          <KPIStatCard label="Abiertas" value={metrics.abiertas} />
          <KPIStatCard label="Respondidas" value={metrics.respondidas} />
          <KPIStatCard label="Cerradas/Rechazadas" value={metrics.cerradas} />
      </section>

      <section className="card p-6">
          <h2 className="text-xl font-semibold">Gestion de responsables</h2>
          <p className="muted mt-1 text-sm">Responsables actuales: {metrics.responsables}</p>

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

            <button className="btn-primary md:col-span-2" type="submit" disabled={saving}>
              {saving ? "Creando..." : "Crear responsable"}
            </button>
          </form>

          {success ? <p className="mt-4 rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{success}</p> : null}
          {error ? <p className="error-text mt-4">{error}</p> : null}
      </section>

      <section className="card p-6">
          <h2 className="text-xl font-semibold">Usuarios y roles</h2>
          <p className="muted mt-1 text-sm">Tabla administrativa con busqueda y paginacion.</p>

          <FilterBar>
            <SearchInput value={searchUser} onChange={setSearchUser} placeholder="Buscar por nombre, correo, usuario o rol" />
            <div />
            <div />
            <div className="flex items-center">
              <p className="muted text-sm">Responsables activos: {metrics.responsables}</p>
            </div>
          </FilterBar>

          {usersFiltered.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Sin usuarios para mostrar" subtitle="Ajusta el filtro de busqueda." />
            </div>
          ) : (
            <div className="mt-4">
              <DataTableWrapper data={usersFiltered} columns={userColumns} title="Listado de usuarios" searchPlaceholder="Buscar en la tabla" />
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
