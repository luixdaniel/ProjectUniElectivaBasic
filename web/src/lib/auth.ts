export type AuthUser = {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  rol: "usuario" | "responsable" | "admin";
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

const TOKEN_KEY = "pqrs_token";
const USER_KEY = "pqrs_user";

export function saveSession(session: AuthSession) {
  sessionStorage.setItem(TOKEN_KEY, session.access_token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function updateStoredUser(user: AuthUser) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
