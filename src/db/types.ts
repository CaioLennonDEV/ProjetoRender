export interface CronogramaItem {
  id: number;
  mes: string;
  atividade: string;
  categoria: string;
  inicio: string; // formato YYYY-MM-DD
  fim: string; // formato YYYY-MM-DD
}

export interface CronogramaState {
  items: CronogramaItem[];
  isLoading: boolean;
  error: string | null;
}

