"use client";

import { useRouter } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";
import { clearSession } from "@/lib/auth";
import { useRoleGuard } from "@/lib/role-guard";

const POWER_BI_EMBED_URL = process.env.NEXT_PUBLIC_POWERBI_EMBED_URL ?? "";
const POWER_BI_REPORT_URL = process.env.NEXT_PUBLIC_POWERBI_REPORT_URL ?? "";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, ready } = useRoleGuard(["admin"], "/dashboard/usuario");

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
      title="Analitica Power BI"
      subtitle={user ? `${user.nombre} ${user.apellido} | ${user.correo}` : ""}
      links={[
        { href: "/dashboard/admin", label: "Inicio admin" },
        { href: "/dashboard/admin/analytics", label: "Analitica" },
        { href: "/", label: "Home" },
      ]}
      onLogout={handleLogout}
    >
      <section className="card p-6">
        <h2 className="text-xl font-semibold">Tablero ejecutivo</h2>
        <p className="muted mt-1 text-sm">
          Pega tu enlace de embed en la variable NEXT_PUBLIC_POWERBI_EMBED_URL para mostrar el reporte.
        </p>

        {POWER_BI_EMBED_URL ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <iframe
              title="Power BI Dashboard"
              src={POWER_BI_EMBED_URL}
              width="100%"
              height="620"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-700">Falta configurar el embed de Power BI</p>
            <p className="muted mt-1 text-sm">
              Agrega NEXT_PUBLIC_POWERBI_EMBED_URL en .env.local con el src del iframe de Power BI.
            </p>
          </div>
        )}

        {POWER_BI_REPORT_URL ? (
          <div className="mt-4">
            <a className="btn-ghost" href={POWER_BI_REPORT_URL} target="_blank" rel="noreferrer">
              Abrir reporte completo
            </a>
          </div>
        ) : null}

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <h3 className="font-semibold">Insights rapidos</h3>
          <ul className="muted mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Monitorea PQRS abiertas por dependencia.</li>
            <li>Revisa tiempo promedio de respuesta por responsable.</li>
            <li>Prioriza categorias con mayor volumen mensual.</li>
          </ul>
        </div>
      </section>
    </DashboardShell>
  );
}
