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
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a101f] text-slate-200 px-4">
      
      <div className="w-full max-w-md bg-[#192231] border border-[#2e3c50] rounded-2xl shadow-2xl p-8 pb-6 relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">PQRS Uni</h1>
          <p className="text-sm text-slate-400 mt-1">Plataforma de Gestión Universitaria</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Correo electrónico institucional
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@uni.edu.co"
            />
            {correo && correo.includes("@") && (
              <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Correo válido
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Contraseña
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                type="password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
              <span className="absolute right-3 top-3.5 text-slate-400">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
            </div>
          </div>

          {error ? (
            <p className="mt-2 text-sm text-rose-400 p-2 bg-rose-400/10 rounded border border-rose-400/20 text-center">
              {error}
            </p>
          ) : null}

          <div className="pt-2">
            <button 
              className="w-full bg-gradient-to-r from-[#4f46e5] to-[#4338ca] text-white rounded-lg py-3 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#192231]"
              type="submit" 
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-5 border-t border-[#2e3c50] text-center">
          <p className="text-xs text-slate-500">Acceso exclusivo para la comunidad universitaria</p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500">
          ¿Problemas para acceder? Contacta a tu administrador o{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            regístrate aquí
          </Link>
          .
        </p>
      </div>

    </main>
  );
}
