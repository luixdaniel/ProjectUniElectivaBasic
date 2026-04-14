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
    <main className="py-14">
      <section className="app-shell card mx-auto max-w-2xl p-8">
        <h1 className="text-3xl font-bold">Crear cuenta</h1>
        <p className="muted mt-2">Registro inicial para usuarios, responsables y admins.</p>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Apellido</label>
            <input className="input" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tipo de documento</label>
            <select className="input" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Cedula</label>
            <input
              className="input"
              value={cedula}
              inputMode="numeric"
              pattern="[0-9]{6,12}"
              maxLength={12}
              minLength={6}
              onChange={(e) => setCedula(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Edad</label>
            <input
              className="input"
              type="number"
              min={1}
              max={100}
              value={edad}
              onChange={(e) => setEdad(Number(e.target.value))}
              required
            />
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
            <label className="mb-1 block text-sm font-medium">Contrasena</label>
            <input
              className="input"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          {error ? <p className="error-text md:col-span-2">{error}</p> : null}

          <button className="btn-primary md:col-span-2" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="muted mt-5 text-sm">
          Ya tienes cuenta? <Link href="/login" className="font-semibold text-teal-700">Inicia sesion</Link>
        </p>
      </section>
    </main>
  );
}
