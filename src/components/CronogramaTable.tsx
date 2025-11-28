import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CronogramaItem } from '@/db/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';

interface CronogramaTableProps {
  items: CronogramaItem[];
  onEdit?: (item: CronogramaItem) => void;
  onDelete?: (id: number) => void;
}

export function CronogramaTable({ items, onEdit, onDelete }: CronogramaTableProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronograma Anual</CardTitle>
        <CardDescription>
          Visualização em tabela dos eventos de Planejamento e Inovação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Mês</TableHead>
                <TableHead>Atividade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                {(onEdit || onDelete) && <TableHead className="w-[100px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={onEdit || onDelete ? 7 : 6} className="text-center text-muted-foreground">
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.mes}</TableCell>
                    <TableCell className="max-w-md">{item.atividade}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                        {item.categoria}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(item.inicio)}</TableCell>
                    <TableCell>{formatDate(item.fim)}</TableCell>
                    {(onEdit || onDelete) && (
                      <TableCell>
                        <div className="flex gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(item)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir "${item.atividade}"?`)) {
                                  onDelete(item.id);
                                }
                              }}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

