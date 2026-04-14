const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string | null;
  body?: Record<string, unknown>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    let detail = "Error inesperado en la API";
    if (typeof payload?.detail === "string") {
      detail = payload.detail;
    } else if (Array.isArray(payload?.detail) && payload.detail.length > 0) {
      const firstError = payload.detail[0];
      const field = Array.isArray(firstError?.loc) ? firstError.loc.slice(1).join(".") : "campo";
      const message = typeof firstError?.msg === "string" ? firstError.msg : "valor invalido";
      detail = `${field}: ${message}`;
    }
    throw new Error(detail);
  }

  return payload as T;
}

export { API_URL };
