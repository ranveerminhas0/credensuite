// API configuration for different environments
const getApiBaseUrl = () => {
  // In production, use the environment variable
  if (import.meta.env.PROD) {
    const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://your-railway-app.railway.app';
    // Normalize: remove any trailing slashes
    return raw.replace(/\/+$/, '');
  }
  
  // In development, use localhost
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to create full API URLs
export const createApiUrl = (endpoint: string) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Convert relative server paths (like /uploads/...) to absolute URLs
export const toAbsoluteUrl = (maybeRelative: string | null | undefined): string | undefined => {
  if (!maybeRelative) return undefined;
  if (maybeRelative.startsWith('http://') || maybeRelative.startsWith('https://')) return maybeRelative;
  if (maybeRelative.startsWith('/uploads/')) return `${API_BASE_URL}${maybeRelative}`;
  return maybeRelative;
};

// Helper function for API calls with proper error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = createApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response;
};
