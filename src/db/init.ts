import { CronogramaItem } from './types';
import {
  getAllCronogramaItems as apiGetAll,
  insertCronogramaItem as apiInsert,
  updateCronogramaItem as apiUpdate,
  deleteCronogramaItem as apiDelete,
} from '@/lib/api';

// Manter a mesma interface para compatibilidade com o código existente
export async function getAllCronogramaItems(): Promise<CronogramaItem[]> {
  return apiGetAll();
}

export async function insertCronogramaItem(
  mes: string,
  atividade: string,
  categoria: string,
  inicio: string,
  fim: string
): Promise<number> {
  const item = await apiInsert(mes, atividade, categoria, inicio, fim);
  return item.id;
}

export async function updateCronogramaItem(
  id: number,
  mes: string,
  atividade: string,
  categoria: string,
  inicio: string,
  fim: string
): Promise<void> {
  await apiUpdate(id, mes, atividade, categoria, inicio, fim);
}

export async function deleteCronogramaItem(id: number): Promise<void> {
  await apiDelete(id);
}
