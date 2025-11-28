import { CronogramaItem } from '@/db/types';

export function exportToCSV(items: CronogramaItem[]): void {
  // Cabeçalhos CSV
  const headers = ['ID', 'Mês', 'Atividade', 'Categoria', 'Início', 'Fim'];
  
  // Converter dados para linhas CSV
  const csvRows = [
    headers.join(','),
    ...items.map(item => [
      item.id,
      `"${item.mes}"`,
      `"${item.atividade}"`,
      `"${item.categoria}"`,
      item.inicio,
      item.fim
    ].join(','))
  ];

  // Criar conteúdo CSV
  const csvContent = csvRows.join('\n');

  // Criar blob e download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `cronograma-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

