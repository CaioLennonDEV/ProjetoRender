import { CronogramaItem } from '@/db/types';

// Em produção, a API está na mesma origem (servidor integrado)
// Em desenvolvimento, pode estar em porta diferente
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  // DELETE retorna 204 sem body
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getAllCronogramaItems(): Promise<CronogramaItem[]> {
  return apiRequest<CronogramaItem[]>('/cronograma');
}

export async function insertCronogramaItem(
  mes: string,
  atividade: string,
  categoria: string,
  inicio: string,
  fim: string
): Promise<CronogramaItem> {
  return apiRequest<CronogramaItem>('/cronograma', {
    method: 'POST',
    body: JSON.stringify({ mes, atividade, categoria, inicio, fim }),
  });
}

export async function updateCronogramaItem(
  id: number,
  mes: string,
  atividade: string,
  categoria: string,
  inicio: string,
  fim: string
): Promise<CronogramaItem> {
  return apiRequest<CronogramaItem>(`/cronograma/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ mes, atividade, categoria, inicio, fim }),
  });
}

export async function deleteCronogramaItem(id: number): Promise<void> {
  return apiRequest<void>(`/cronograma/${id}`, {
    method: 'DELETE',
  });
}

