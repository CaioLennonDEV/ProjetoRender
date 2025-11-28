import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/utils/csvExport';
import { CronogramaItem } from '@/db/types';

interface ExportButtonProps {
  items: CronogramaItem[];
}

export function ExportButton({ items }: ExportButtonProps) {
  const handleExport = () => {
    exportToCSV(items);
  };

  return (
    <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
      <Download className="mr-2 h-4 w-4" />
      Exportar para CSV
    </Button>
  );
}

