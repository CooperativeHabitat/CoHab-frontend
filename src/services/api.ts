
import { ProblemDetail } from "@/error/types/serverErrorResponses";

const API_BASE_URL = import.meta.env.COHAB_API_URL;

async function handleApiError(response: Response) {
    var body = await response.json()
    console.log(body.properties)
        throw new ProblemDetail(
        body.title,
        body.status,
        body.detail,
        body.properties,
        body.fieldErrors
    );
}


export async function apiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as HeadersInit;

  if (token && token !== "undefined") {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  if(!response.ok){
    await handleApiError(response)
  }

  let body: any = null;
  try{
    body = await response.json();
  } catch{}

  return {
    body,
    ok: response.ok,
    status: response.status
  };
}

export const apiService = {
  async get(url: string) {
    const result = await apiRequest(url);
    return result;
  },

  async post(url: string, data: any) {
    console.log('Запрос на: ' + url);
    const result = await apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('Запрос прошел без ошибок.')
    return result;
  },

  async put(url: string, data: any) {
    const result = await apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  },

  async delete(url: string, data: any) {
    const result = await apiRequest(url, {
      method: 'DELETE',
      body: JSON.stringify(data)});
    return result;
  },

};
