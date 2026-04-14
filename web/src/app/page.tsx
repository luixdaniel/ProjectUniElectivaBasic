import Link from "next/link";

export default function Home() {
  return (
    <main className="py-14 md:py-20">
      <section className="app-shell">
        <div className="card relative overflow-hidden p-8 md:p-14">
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-teal-200/70 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-amber-200/80 blur-2xl" />

          <p className="text-sm font-semibold tracking-[0.24em] text-teal-700">PQRS UNIVERSIDAD</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
            Un inicio moderno para radicar, gestionar y cerrar solicitudes con trazabilidad real.
          </h1>
          <p className="muted mt-5 max-w-3xl text-lg">
            Plataforma con autenticacion JWT y dashboards separados por rol: usuario, responsable y administrador.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary">
              Iniciar sesion
            </Link>
            <Link href="/register" className="btn-ghost">
              Crear cuenta
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              Ir a mi dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="card p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Usuario</p>
            <p className="mt-2 text-xl font-bold">Radica y consulta</p>
            <p className="muted mt-2 text-sm">Crea PQRS, revisa detalle y sigue el historial de tu caso.</p>
            <Link href="/dashboard/usuario" className="btn-ghost mt-4 inline-flex">Ver dashboard usuario</Link>
          </article>

          <article className="card p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Responsable</p>
            <p className="mt-2 text-xl font-bold">Gestiona y responde</p>
            <p className="muted mt-2 text-sm">Atiende la bandeja asignada, cambia estados y registra respuestas.</p>
            <Link href="/dashboard/responsable" className="btn-ghost mt-4 inline-flex">Ver dashboard responsable</Link>
          </article>

          <article className="card p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Admin</p>
            <p className="mt-2 text-xl font-bold">Control y seguimiento</p>
            <p className="muted mt-2 text-sm">Visualiza panorama general y opera sobre todos los flujos.</p>
            <Link href="/dashboard/admin" className="btn-ghost mt-4 inline-flex">Ver dashboard admin</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
