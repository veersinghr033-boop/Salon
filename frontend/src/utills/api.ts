const API_BASE_URL = '/api';

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    credentials: 'include', // This ensures cookies are sent with requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function apiGet(endpoint: string): Promise<any> {
  return apiCall(endpoint, { method: 'GET' });
}

export async function apiPost(endpoint: string, data?: any): Promise<any> {
  return apiCall(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiPut(endpoint: string, data?: any): Promise<any> {
  return apiCall(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiDelete(endpoint: string): Promise<any> {
  return apiCall(endpoint, { method: 'DELETE' });
}