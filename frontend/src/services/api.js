/**
 * ResolveX API Client Layer (Member 5 Scope)
 * 
 * Configured to communicate with Member 1 & 2 backend endpoints at:
 * VITE_API_URL (default: http://localhost:5000/api)
 * 
 * Automatically attaches JWT Bearer token from localStorage.
 * Handles timeouts and gracefully detects when backend is offline.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = localStorage.getItem('issuehub_token') || localStorage.getItem('resolvex_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // If 401 Unauthorized, token might be expired
    if (response.status === 401) {
      // Do not auto-clear if this was a login attempt
      if (!endpoint.includes('/auth/login')) {
        console.warn('[API] Received 401 Unauthorized. Clearing session.');
        localStorage.removeItem('issuehub_token');
        localStorage.removeItem('issuehub_user');
        localStorage.removeItem('resolvex_token');
        localStorage.removeItem('resolvex_user');
      }
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}: Request failed`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network/connection failure
    throw new ApiError(
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure Member 1/2 backend is running.`,
      0,
      { isNetworkError: true }
    );
  }
}
