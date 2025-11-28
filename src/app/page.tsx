import { useState } from 'react';
import { GanttChart } from '@/components/GanttChart';
import { CronogramaTable } from '@/components/CronogramaTable';
import { ExportButton } from '@/components/ExportButton';
import { CronogramaForm } from '@/components/CronogramaForm';
import { Button } from '@/components/ui/button';
import { useCronograma } from '@/hooks/useCronograma';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { addCronogramaItem, editCronogramaItem, removeCronogramaItem } from '@/store/cronogramaSlice';
import { CronogramaItem } from '@/db/types';
import { Plus } from 'lucide-react';

export default function HomePage() {
  const { items, isLoading, error } = useCronograma();
  const dispatch = useDispatch<AppDispatch>();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CronogramaItem | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: CronogramaItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    dispatch(removeCronogramaItem(id));
  };

  const handleSave = (item: { id?: number; mes: string; atividade: string; categoria: string; inicio: string; fim: string }) => {
    if (item.id) {
      dispatch(editCronogramaItem(item as { id: number; mes: string; atividade: string; categoria: string; inicio: string; fim: string }));
    } else {
      dispatch(addCronogramaItem(item));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando cronograma...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar cronograma</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 min-h-screen">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cronograma Anual</h1>
        <p className="text-muted-foreground">
          Planejamento e Inovação - Visualização em Gantt Chart e Tabela
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Evento
        </Button>
        <ExportButton items={items} />
      </div>

      <GanttChart items={items} />

      <CronogramaTable 
        items={items} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CronogramaForm
        item={editingItem}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />
    </div>
  );
}

