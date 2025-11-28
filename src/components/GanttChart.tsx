import { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import 'frappe-gantt/dist/frappe-gantt.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CronogramaItem } from '@/db/types';
import './GanttChart.css';

interface GanttChartProps {
  items: CronogramaItem[];
}

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  custom_class?: string;
}

const categoriaColors: Record<string, string> = {
  'Planejamento': 'blue',
  'Capacitação': 'green',
  'Inovação': 'purple',
  'Projeto Piloto': 'orange',
  'Evento': 'red',
};

export function GanttChart({ items }: GanttChartProps) {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<Gantt | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!ganttContainer.current || items.length === 0) {
      setIsInitialized(false);
      return;
    }

    // Limpar conteúdo anterior
    if (ganttContainer.current) {
      ganttContainer.current.innerHTML = '';
    }
    ganttInstance.current = null;

    // Converter items para formato do frappe-gantt
    // Primeiro, separar atividades que contêm "-" e criar um mapa para agrupar por nome
    const taskMap = new Map<string, { start: Date; end: Date; categoria: string; mes: string }>();
    
    items.forEach((item) => {
      // Garantir que as datas são válidas
      const startDate = new Date(item.inicio + 'T00:00:00');
      const endDate = new Date(item.fim + 'T23:59:59');
      
      // Validar datas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Data inválida:', item.inicio, item.fim);
        return;
      }

      // Separar atividades por "-"
      const atividades = item.atividade.split(' - ').map(a => a.trim()).filter(a => a.length > 0);
      
      atividades.forEach((atividade) => {
        const key = atividade;
        const existing = taskMap.get(key);
        
        if (existing) {
          // Atualizar datas para pegar o período mais amplo
          if (startDate < existing.start) {
            existing.start = startDate;
          }
          if (endDate > existing.end) {
            existing.end = endDate;
          }
        } else {
          // Criar nova entrada
          taskMap.set(key, {
            start: startDate,
            end: endDate,
            categoria: item.categoria,
            mes: item.mes
          });
        }
      });
    });

    // Converter o mapa em array de tarefas
    const tasks: GanttTask[] = Array.from(taskMap.entries()).map(([atividade, data], index) => ({
      id: `task-${index}`,
      name: atividade,
      start: data.start.toISOString().split('T')[0],
      end: data.end.toISOString().split('T')[0],
      progress: 0,
      custom_class: categoriaColors[data.categoria] || 'blue',
    }));

    // Função para inicializar o Gantt
    const initializeGantt = () => {
      if (!ganttContainer.current) return;

      try {
        console.log('Inicializando Gantt com', tasks.length, 'tarefas');
        console.log('Tasks:', tasks);
        
        ganttInstance.current = new Gantt(ganttContainer.current, tasks, {
          view_mode: 'Month',
          header_height: 60,
          column_width: 60,
          step: 24,
          bar_height: 40,
          bar_corner_radius: 4,
          arrow_curve: 5,
          padding: 25,
          date_format: 'YYYY-MM-DD',
          popup_trigger: 'click',
          on_click: (task: any) => {
            console.log('Task clicked:', task);
          },
          on_date_change: (task: any, start: Date, end: Date) => {
            console.log('Date changed:', task, start, end);
          },
          on_progress_change: (task: any, progress: number) => {
            console.log('Progress changed:', task, progress);
          },
          on_view_change: (mode: string) => {
            console.log('View mode changed:', mode);
          },
        });
        
         // Ajustar o SVG para permitir scroll horizontal adequado e aplicar cores
         setTimeout(() => {
           const svg = ganttContainer.current?.querySelector('svg');
           if (svg) {
             svg.style.minWidth = '100%';
             svg.style.width = 'auto';
             // Garantir que o SVG tenha largura suficiente para todo o período
             const svgWidth = svg.getBoundingClientRect().width;
             if (svgWidth < 2000) {
               svg.style.width = '2000px';
             }
             
             // Mapa de cores
             const colorMap: Record<string, string> = {
               'blue': '#3b82f6',
               'green': '#10b981',
               'purple': '#8b5cf6',
               'orange': '#f97316',
               'red': '#ef4444',
             };
             
             // Aplicar cores diretamente nas barras
             tasks.forEach((task) => {
               // Encontrar todas as barras relacionadas a esta tarefa
               const barGroups = svg.querySelectorAll(`g.bar-wrapper`);
               barGroups.forEach((barGroup, index) => {
                 if (index < tasks.length && tasks[index].id === task.id) {
                   const barInner = barGroup.querySelector('.bar-inner') as SVGElement;
                   if (barInner) {
                     const color = colorMap[task.custom_class || 'blue'] || '#3b82f6';
                     barInner.setAttribute('fill', color);
                     barInner.style.fill = color;
                   }
                   // Adicionar classe CSS também
                   barGroup.classList.add(`bar-${task.custom_class || 'blue'}`);
                 }
               });
             });
             
             // Aplicar cores em todas as barras encontradas
             const allBars = svg.querySelectorAll('.bar-inner');
             allBars.forEach((bar, index) => {
               if (tasks[index]) {
                 const task = tasks[index];
                 const color = colorMap[task.custom_class || 'blue'] || '#3b82f6';
                 (bar as SVGElement).setAttribute('fill', color);
                 (bar as SVGElement).style.fill = color;
               }
             });
           }
         }, 500);
        setIsInitialized(true);
        console.log('Gantt Chart inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao criar Gantt Chart:', error);
        console.error('Detalhes do erro:', error);
        setIsInitialized(false);
      }
    };

    // Aguardar um pouco para garantir que o DOM está pronto e o container tem dimensões
    const timeoutId = setTimeout(() => {
      if (!ganttContainer.current) {
        console.warn('Container do Gantt não encontrado');
        return;
      }

      // Verificar se o container tem dimensões
      const rect = ganttContainer.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn('Container do Gantt não tem dimensões adequadas, tentando novamente...');
        // Tentar novamente após um delay maior
        setTimeout(() => {
          if (!ganttContainer.current) return;
          initializeGantt();
        }, 500);
        return;
      }

      initializeGantt();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (ganttContainer.current) {
        ganttContainer.current.innerHTML = '';
      }
      ganttInstance.current = null;
      setIsInitialized(false);
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gantt Chart</CardTitle>
          <CardDescription>
            Visualização cronológica dos eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gantt Chart</CardTitle>
        <CardDescription>
          Visualização cronológica dos eventos de Planejamento e Inovação
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isInitialized && items.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            Carregando Gantt Chart...
          </div>
        )}
        <div className="w-full border rounded-md bg-white shadow-sm">
          <div 
            ref={ganttContainer} 
            className="gantt-container"
            style={{ minHeight: '700px', width: '100%' }}
          />
        </div>
        {isInitialized && (
          <div className="mt-2 text-xs text-muted-foreground">
            {items.length} eventos carregados
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500" />
            <span>Planejamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500" />
            <span>Capacitação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-purple-500" />
            <span>Inovação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-500" />
            <span>Projeto Piloto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-500" />
            <span>Evento</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

