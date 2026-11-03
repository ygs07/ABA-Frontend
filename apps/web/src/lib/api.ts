export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "api";

type ApiEnvelope<T> = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
};

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(
    value &&
      typeof value === "object" &&
      ("success" in value || "statusCode" in value) &&
      "data" in value,
  );
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  // Mock logic placeholder
  if (API_MODE === "mock") {
    return {} as T;
  }
  const res = await fetch(endpoint, {
    ...options,
    credentials: options?.credentials ?? "include",
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => undefined)) as ApiEnvelope<unknown> | undefined;
    const message = payload?.message || (typeof payload?.data === "string" ? payload.data : undefined);
    throw new ApiError(
      res.status,
      message || `Request failed with status ${res.status}`,
    );
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  const payload = (await res.json()) as T | ApiEnvelope<T>;
  return isApiEnvelope<T>(payload) ? (payload.data as T) : payload;
}
