"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { AuthSession, saveSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<AuthSession>("/auth/login", {
        method: "POST",
        body: { correo, contrasena },
      });

      saveSession(data);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo iniciar sesion";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="py-14">
      <section className="app-shell card mx-auto max-w-xl p-8">
        <h1 className="text-3xl font-bold">Iniciar sesion</h1>
        <p className="muted mt-2">Accede con correo y contrasena para usar la plataforma.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Correo</label>
            <input
              className="input"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Contrasena</label>
            <input
              className="input"
              type="password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="muted mt-5 text-sm">
          No tienes cuenta? <Link href="/register" className="font-semibold text-teal-700">Registrate</Link>
        </p>
      </section>
    </main>
  );
}
