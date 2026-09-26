const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Network response error" }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
