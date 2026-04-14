"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthUser, getToken, getUser } from "@/lib/auth";

type Role = "usuario" | "responsable" | "admin";

type UseRoleGuardResult = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
};

export function useRoleGuard(allowedRoles: Role[], fallbackPath: string = "/dashboard"): UseRoleGuardResult {
  const router = useRouter();
  const rolesKey = allowedRoles.join("|");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const allowed = rolesKey.split("|") as Role[];
    const currentToken = getToken();
    const currentUser = getUser();

    if (!currentToken || !currentUser) {
      router.replace("/login");
      return;
    }

    if (!allowed.includes(currentUser.rol as Role)) {
      router.replace(fallbackPath);
      return;
    }

    const timer = window.setTimeout(() => {
      setToken(currentToken);
      setUser(currentUser);
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [rolesKey, fallbackPath, router]);

  return { user, token, ready };
}
