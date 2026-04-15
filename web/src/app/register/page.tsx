"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { AuthSession, saveSession } from "@/lib/auth";

type TipoDocumento = "CC" | "TI";

const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
const CEDULA_CC_TI_REGEX = /^[0-9]{6,12}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("CC");
  const [cedula, setCedula] = useState("");
  const [edad, setEdad] = useState(18);
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const nombreNormalizado = nombre.trim();
      const apellidoNormalizado = apellido.trim();
      if (!NOMBRE_REGEX.test(nombreNormalizado)) {
        throw new Error("El nombre solo puede contener letras y espacios");
      }
      if (!NOMBRE_REGEX.test(apellidoNormalizado)) {
        throw new Error("El apellido solo puede contener letras y espacios");
      }

      const edadNormalizada = Number.isFinite(edad) ? Math.trunc(edad) : NaN;
      if (!Number.isInteger(edadNormalizada) || edadNormalizada <= 0 || edadNormalizada > 100) {
        throw new Error("La edad debe ser mayor a 0 y menor o igual a 100");
      }

      const cedulaNormalizada = cedula.toUpperCase().replace(/[\s.-]/g, "");
      if (!CEDULA_CC_TI_REGEX.test(cedulaNormalizada)) {
        throw new Error("La cedula para CC/TI debe tener entre 6 y 12 digitos");
      }

      const data = await apiRequest<AuthSession>("/auth/register", {
        method: "POST",
        body: {
          nombre: nombreNormalizado,
          apellido: apellidoNormalizado,
          tipo_documento: tipoDocumento,
          cedula: cedulaNormalizada,
          edad: edadNormalizada,
          usuario: usuario.trim(),
          correo: correo.trim().toLowerCase(),
          contrasena,
          rol: "usuario",
        },
      });

      saveSession(data);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo registrar el usuario";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a101f] text-slate-200 px-4 py-12">
      
      <div className="w-full max-w-2xl bg-[#192231] border border-[#2e3c50] rounded-2xl shadow-2xl p-8 relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Crear cuenta</h1>
          <p className="text-sm text-slate-400 mt-1">Únete a la plataforma PQRS Uni</p>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Nombre</label>
            <input 
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
              value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej. Juan" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Apellido</label>
            <input 
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
              value={apellido} onChange={(e) => setApellido(e.target.value)} required placeholder="Ej. Pérez" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Tipo de documento</label>
            <select 
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
              value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}>
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="TI">Tarjeta de Identidad (TI)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Número de Cédula</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              value={cedula}
              inputMode="numeric"
              pattern="[0-9]{6,12}"
              maxLength={12}
              minLength={6}
              onChange={(e) => setCedula(e.target.value)}
              required
              placeholder="Ej. 1000222333"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Edad</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              type="number"
              min={1}
              max={100}
              value={edad}
              onChange={(e) => setEdad(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Usuario</label>
            <input 
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
              value={usuario} onChange={(e) => setUsuario(e.target.value)} required placeholder="Ej. jperez" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Correo Electrónico</label>
            <input 
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
              type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required placeholder="tu@uni.edu.co" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Contraseña</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-[#eef2ff] border border-transparent text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              placeholder="Crea tu contraseña"
            />
          </div>
          {error ? <p className="mt-2 text-sm text-rose-400 p-2 bg-rose-400/10 rounded border border-rose-400/20 text-center md:col-span-2">{error}</p> : null}

          <div className="pt-4 md:col-span-2">
            <button 
              className="w-full bg-gradient-to-r from-[#4f46e5] to-[#4338ca] text-white rounded-lg py-3 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#192231]"
              type="submit" 
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Registrarte"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-5 border-t border-[#2e3c50] text-center">
          <p className="text-sm text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 font-semibold">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
