export interface KitchenRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: Record<string, unknown>;
  params?: Record<string, string | string[] | undefined>;
}

export interface KitchenError {
  status: number;
  message: string;
  endpoint: string;
  errors?: Record<string, string[]>;
}

export class KitchenClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const baseUrl = process.env.KITCHEN_BASE_URL;
    const apiKey = process.env.KITCHEN_API_KEY;

    if (!baseUrl) {
      throw new Error("KITCHEN_BASE_URL environment variable is required");
    }
    if (!apiKey) {
      throw new Error("KITCHEN_API_KEY environment variable is required");
    }

    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  async request<T = unknown>(options: KitchenRequestOptions): Promise<T> {
    const url = new URL(`${this.baseUrl}${options.path}`);

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(`${key}[]`, v);
          }
        } else {
          url.searchParams.set(key, value);
        }
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Authorization: `Bearer ${this.apiKey}`,
    };

    const response = await fetch(url.toString(), {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      let errorBody: Record<string, unknown> = {};
      try {
        errorBody = (await response.json()) as Record<string, unknown>;
      } catch {
        // Response may not be JSON
      }

      const error: KitchenError = {
        status: response.status,
        message:
          (errorBody.message as string) ||
          response.statusText ||
          "Unknown error",
        endpoint: `${options.method} ${options.path}`,
      };

      if (errorBody.errors) {
        error.errors = errorBody.errors as Record<string, string[]>;
      }

      throw error;
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null as T;
    }

    const text = await response.text();
    if (!text || text === "null") {
      return null as T;
    }

    return JSON.parse(text) as T;
  }
}

export function formatError(error: unknown): string {
  if (isKitchenError(error)) {
    let msg = `Error ${error.status}: ${error.message} on ${error.endpoint}`;
    if (error.errors) {
      for (const [field, messages] of Object.entries(error.errors)) {
        msg += `\n- ${field}: ${messages.join(", ")}`;
      }
    }
    return msg;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function isKitchenError(error: unknown): error is KitchenError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "endpoint" in error
  );
}
