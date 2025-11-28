import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CronogramaItem } from '@/db/types';

interface CronogramaFormProps {
  item?: CronogramaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: {
    id?: number;
    mes: string;
    atividade: string;
    categoria: string;
    inicio: string;
    fim: string;
  }) => void;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const categorias = [
  'Planejamento',
  'Capacitação',
  'Inovação',
  'Projeto Piloto',
  'Evento'
];

export function CronogramaForm({ item, open, onOpenChange, onSave }: CronogramaFormProps) {
  const [formData, setFormData] = useState({
    mes: '',
    atividade: '',
    categoria: '',
    inicio: '',
    fim: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        mes: item.mes,
        atividade: item.atividade,
        categoria: item.categoria,
        inicio: item.inicio,
        fim: item.fim,
      });
    } else {
      setFormData({
        mes: '',
        atividade: '',
        categoria: '',
        inicio: '',
        fim: '',
      });
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(item && { id: item.id }),
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Evento' : 'Adicionar Novo Evento'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Altere as informações do evento abaixo.' : 'Preencha os dados para adicionar um novo evento ao cronograma.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mes">Mês</Label>
              <Select
                id="mes"
                value={formData.mes}
                onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                required
              >
                <option value="">Selecione o mês</option>
                {meses.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="atividade">Atividade</Label>
              <Input
                id="atividade"
                value={formData.atividade}
                onChange={(e) => setFormData({ ...formData, atividade: e.target.value })}
                placeholder="Ex: Capacitação de Embaixadores"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
              >
                <option value="">Selecione a categoria</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="inicio">Data de Início</Label>
                <Input
                  id="inicio"
                  type="date"
                  value={formData.inicio}
                  onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fim">Data de Fim</Label>
                <Input
                  id="fim"
                  type="date"
                  value={formData.fim}
                  onChange={(e) => setFormData({ ...formData, fim: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

