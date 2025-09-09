import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "@/lib/auth";

async function getAuthTokenSafe(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = await getAuthTokenSafe();
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 403) {
    try {
      const msg = await res.json();
      if (msg?.code === "ACCESS_DENIED") {
        // Blink red modal/toast via DOM
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.left = '50%';
        div.style.transform = 'translateX(-50%)';
        div.style.padding = '12px 16px';
        div.style.background = 'red';
        div.style.color = 'white';
        div.style.fontWeight = 'bold';
        div.style.borderRadius = '8px';
        div.style.animation = 'blink 0.8s step-start 6';
        div.textContent = msg.message || 'ACCESS DENIED';
        const style = document.createElement('style');
        style.innerHTML = '@keyframes blink { 50% { opacity: 0; } }';
        document.head.appendChild(style);
        document.body.appendChild(div);
        setTimeout(() => { div.remove(); style.remove(); }, 5000);
      }
    } catch {}
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = await getAuthTokenSafe();
    if (!token) {
      // Avoid hitting the network before authentication is ready
      if (unauthorizedBehavior === "returnNull") return null;
      throw new Error("UNAUTHENTICATED");
    }
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
