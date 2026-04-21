"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import DashboardShell from "@/components/layout/DashboardShell";
import { apiRequest } from "@/lib/api";
import { clearSession, updateStoredUser } from "@/lib/auth";
import { useRoleGuard } from "@/lib/role-guard";

type UserProfile = {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  edad: number;
  usuario: string;
  correo: string;
  rol: "usuario" | "responsable" | "admin";
};

type ProfileResponse = { resultado: UserProfile };

export default function UserProfilePage() {
  const router = useRouter();
  const { user, token, ready } = useRoleGuard(["usuario"], "/dashboard");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [edad, setEdad] = useState(18);
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token || !ready) return;

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest<ProfileResponse>("/users/me", { token });
        const profile = data.resultado;
        setNombre(profile.nombre);
        setApellido(profile.apellido);
        setEdad(profile.edad);
        setUsuario(profile.usuario);
        setCorreo(profile.correo);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar el perfil";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token, ready]);

  async function onSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload: Record<string, string | number> = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        edad,
        usuario: usuario.trim(),
        correo: correo.trim().toLowerCase(),
      };

      if (contrasena.trim()) {
        payload.contrasena = contrasena;
      }

      const data = await apiRequest<ProfileResponse>("/users/me", {
        method: "PATCH",
        token,
        body: payload,
      });

      updateStoredUser({
        id: data.resultado.id,
        nombre: data.resultado.nombre,
        apellido: data.resultado.apellido,
        usuario: data.resultado.usuario,
        correo: data.resultado.correo,
        rol: data.resultado.rol,
      });

      setContrasena("");
      setSuccess("Perfil actualizado correctamente");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el perfil";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteMyAccount() {
    if (!token) return;
    const confirmed = window.confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción eliminará tus PQRS creadas.");
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      await apiRequest<{ resultado: string }>("/users/me", {
        method: "DELETE",
        token,
      });

      clearSession();
      router.replace("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar la cuenta";
      setError(message);
      setDeleting(false);
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
      roleLabel="Dashboard Usuario"
      title="Mi perfil"
      subtitle={user ? `${user.nombre} ${user.apellido} | ${user.correo}` : ""}
      links={[
        { href: "/dashboard/usuario", label: "Mi Resumen", category: "GENERAL" },
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
        <h2 className="text-xl font-semibold">Editar datos de la cuenta</h2>
        <p className="muted mt-1 text-sm">Actualiza tu información personal y credenciales de acceso.</p>

        {loading ? (
          <p className="muted mt-4">Cargando perfil...</p>
        ) : (
          <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSaveProfile}>
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre</label>
              <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Apellido</label>
              <input className="input" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Usuario</label>
              <input className="input" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Correo</label>
              <input className="input" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Edad</label>
              <input className="input" type="number" min={18} max={100} value={edad} onChange={(e) => setEdad(Number(e.target.value))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nueva contraseña (opcional)</label>
              <input
                className="input"
                type="password"
                minLength={6}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Dejar vacía para no cambiar"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-2 pt-2">
              <button className="btn-primary" type="submit" disabled={saving || loading}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}

        {success ? <p className="mt-4 rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{success}</p> : null}
        {error ? <p className="error-text mt-4">{error}</p> : null}
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Zona de riesgo</h2>
        <p className="muted mt-1 text-sm">Eliminar la cuenta borra tus PQRS creadas y cierra tu sesión.</p>

        <div className="mt-4">
          <button className="btn-ghost" type="button" onClick={onDeleteMyAccount} disabled={deleting}>
            {deleting ? "Eliminando cuenta..." : "Eliminar mi cuenta"}
          </button>
        </div>
      </section>
    </DashboardShell>
  );
}
