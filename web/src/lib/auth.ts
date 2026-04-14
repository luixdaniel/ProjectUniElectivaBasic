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
  localStorage.setItem(TOKEN_KEY, session.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
