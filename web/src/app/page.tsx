import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a101f] text-slate-200 px-4 md:py-20 py-10 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
      
      <section className="w-full max-w-5xl z-10">
        <div className="bg-[#192231]/80 backdrop-blur border border-[#2e3c50] shadow-2xl relative overflow-hidden rounded-[2rem] p-10 md:p-20 text-center">
          
          <div className="mx-auto bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
            </svg>
          </div>

          <p className="text-sm font-bold tracking-[0.24em] text-indigo-400 uppercase">
            Plataforma PQRS Uni
          </p>
          <h1 className="mt-4 mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
            Tu centro de gestión <br/> y soluciones.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-slate-400 leading-relaxed">
            Una interfaz moderna y oscura para radicar, gestionar y supervisar todas las peticiones, quejas, reclamos y sugerencias universitarias con trazabilidad en tiempo real.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-[#4f46e5] to-[#4338ca] text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
            >
              Ingresar al sistema
            </Link>
            <Link 
              href="/register" 
              className="px-8 py-3.5 rounded-xl font-semibold text-slate-300 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="bg-[#192231]/60 backdrop-blur border border-[#2e3c50] shadow-xl p-8 rounded-2xl hover:border-indigo-500/40 transition-colors">
            <div className="bg-indigo-500/10 w-12 h-12 flex items-center justify-center rounded-lg mb-6">
               <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <p className="text-xl font-bold text-slate-100">Usuarios</p>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Radica tu solicitud rápidamente, incluye detalles y revisa desde el dashboard el historial hasta que sea respondida.</p>
          </article>

          <article className="bg-[#192231]/60 backdrop-blur border border-[#2e3c50] shadow-xl p-8 rounded-2xl hover:border-indigo-500/40 transition-colors">
            <div className="bg-indigo-500/10 w-12 h-12 flex items-center justify-center rounded-lg mb-6">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <p className="text-xl font-bold text-slate-100">Responsables</p>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Atiende los casos asignados a tu área, evalúa las prioridades, actualiza estados y envía la respuesta oficial al interesado.</p>
          </article>

          <article className="bg-[#192231]/60 backdrop-blur border border-[#2e3c50] shadow-xl p-8 rounded-2xl hover:border-indigo-500/40 transition-colors">
             <div className="bg-indigo-500/10 w-12 h-12 flex items-center justify-center rounded-lg mb-6">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </div>
            <p className="text-xl font-bold text-slate-100">Supervisión</p>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Perspectiva gerencial para controlar SLAs, registrar responsables, resetear claves y ver analíticas en Power BI.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
