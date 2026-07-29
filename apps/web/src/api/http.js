import { browserStorage } from "../utils/storage.js";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const REQUEST_TIMEOUT_MS = 10000;

export async function apiRequest(path, options = {}) {
  const token = browserStorage.get("deliveryBurger.token");
  const headers = new Headers(options.headers);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      const error = new Error(
        payload?.error?.message ?? `Falha ao comunicar com o servidor (${response.status}).`
      );
      error.status = response.status;
      error.code = payload?.error?.code;
      error.details = payload?.error?.details;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("A API demorou demais para responder.");
    }

    if (error instanceof TypeError) {
      throw new Error("Não foi possível conectar à API em http://localhost:3333.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
