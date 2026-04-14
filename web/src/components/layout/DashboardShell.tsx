"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type SidebarLink = {
  href: string;
  label: string;
};

type DashboardShellProps = {
  roleLabel: string;
  title: string;
  subtitle?: string;
  links: SidebarLink[];
  onLogout: () => void;
  children: ReactNode;
};

function LinkIcon({ href }: { href: string }) {
  const key = href.toLowerCase();

  if (key.includes("analytics")) {
    return (
      <svg viewBox="0 0 24 24" className="dashboard-link-icon" aria-hidden="true">
        <path d="M4 19h16M7 16V9m5 7V5m5 11v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes("responsable")) {
    return (
      <svg viewBox="0 0 24 24" className="dashboard-link-icon" aria-hidden="true">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19a5 5 0 0 1 10 0M13 19a5 5 0 0 1 8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
    );
  }

  if (key.includes("pqrs") || key.includes("usuario")) {
    return (
      <svg viewBox="0 0 24 24" className="dashboard-link-icon" aria-hidden="true">
        <path d="M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 4h4M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="dashboard-link-icon" aria-hidden="true">
      <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardShell({ roleLabel, title, subtitle, links, onLogout, children }: DashboardShellProps) {
  const pathname = usePathname();
  const displayName = (subtitle?.split("|")[0] || title).trim();
  const avatarLetter = (displayName[0] || "U").toUpperCase();

  return (
    <main className="dashboard-workspace">
      <section className="dashboard-grid-wide">
        <aside className="dashboard-sidebar">
          <div className="dashboard-brand">
            <div className="dashboard-brand-row">
              <span className="dashboard-brand-icon" aria-hidden="true">⌘</span>
              <p className="text-sm font-semibold">PQRS Uni</p>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{roleLabel}</p>
          </div>

          <nav className="dashboard-nav">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${pathname === link.href ? "sidebar-link-active" : ""}`}
              >
                <LinkIcon href={link.href} />
                {link.label}
              </Link>
            ))}
          </nav>

          <button className="btn-primary mt-auto w-full" onClick={onLogout}>
            Cerrar sesion
          </button>
        </aside>

        <section className="dashboard-content">
          <header className="dashboard-topbar">
            <input className="dashboard-search" placeholder="Buscar..." />
            <div className="dashboard-topbar-right">
              <button className="dashboard-bell" aria-label="Notificaciones" type="button">
                <span className="dashboard-bell-dot" />
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 10a6 6 0 0 1 12 0v4l1.5 2h-15L6 14v-4Zm4.5 8a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                </svg>
              </button>
              <div className="dashboard-userbox">
                <p className="dashboard-user-role">{roleLabel}</p>
                <p className="dashboard-user-name">{displayName}</p>
              </div>
              <span className="dashboard-avatar" aria-hidden="true">{avatarLetter}</span>
            </div>
          </header>

          <div className="dashboard-main">
            <section className="dashboard-page-head">
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle ? <p className="muted mt-1 text-sm">{subtitle}</p> : null}
            </section>

            {children}
          </div>
        </section>
      </section>
    </main>
  );
}
