import { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import 'frappe-gantt/dist/frappe-gantt.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CronogramaItem } from '@/db/types';
import { useAppDispatch } from '@/store/store';
import { editCronogramaItem } from '@/store/cronogramaSlice';
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

// Função auxiliar para determinar o mês baseado na data
function getMonthFromDate(date: Date): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[date.getMonth()];
}

export function GanttChart({ items }: GanttChartProps) {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<Gantt | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useAppDispatch();
  // Manter referência atualizada aos items para uso no callback
  const itemsRef = useRef<CronogramaItem[]>(items);
  // Flag para evitar reinicialização durante atualização programática
  const isUpdatingRef = useRef(false);
  // Hash dos items para detectar mudanças reais
  const itemsHashRef = useRef<string>('');
  
  useEffect(() => {
    itemsRef.current = items;
    
    // Criar hash dos items para detectar mudanças reais
    const currentHash = JSON.stringify(items.map(i => ({ id: i.id, inicio: i.inicio, fim: i.fim })));
    
    // Se estamos atualizando programaticamente, não reinicializar
    if (isUpdatingRef.current) {
      console.log('⏸️ Atualização programática detectada, pulando reinicialização do Gantt');
      // Resetar a flag após um pequeno delay para permitir que o Redux termine de atualizar
      setTimeout(() => {
        isUpdatingRef.current = false;
        itemsHashRef.current = currentHash;
      }, 100);
      return;
    }
    
    // Se o hash não mudou, não reinicializar
    if (itemsHashRef.current === currentHash && itemsHashRef.current !== '') {
      console.log('⏸️ Items não mudaram, pulando reinicialização');
      return;
    }
    
    itemsHashRef.current = currentHash;
  }, [items]);

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
    // Criar uma barra separada para cada item individual (não agrupar)
    const tasks: GanttTask[] = [];
    
    items.forEach((item) => {
      // Validar que as datas existem
      if (!item.inicio || !item.fim) {
        console.error('Item sem datas válidas:', item);
        return;
      }

      // Normalizar formato de data (pode vir como string ou Date)
      const inicioStr = typeof item.inicio === 'string' 
        ? item.inicio.split('T')[0] 
        : new Date(item.inicio).toISOString().split('T')[0];
      const fimStr = typeof item.fim === 'string'
        ? item.fim.split('T')[0]
        : new Date(item.fim).toISOString().split('T')[0];

      // Validar formato de data (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(inicioStr) || !/^\d{4}-\d{2}-\d{2}$/.test(fimStr)) {
        console.error('Formato de data inválido:', inicioStr, fimStr);
        return;
      }

      tasks.push({
        id: `item-${item.id}`, // Usar ID do item como identificador único
        name: item.atividade,
        start: inicioStr,
        end: fimStr,
        progress: 0,
        custom_class: categoriaColors[item.categoria] || 'blue',
      });
    });

    // Função para inicializar o Gantt
    const initializeGantt = () => {
      if (!ganttContainer.current) return;

      try {
        // Validar que temos tarefas válidas
        if (tasks.length === 0) {
          console.warn('Nenhuma tarefa válida para exibir no Gantt');
          setIsInitialized(false);
          return;
        }

        // Validar todas as tarefas antes de passar para o Gantt
        const validTasks = tasks.filter(task => {
          if (!task.start || !task.end) {
            console.error('Tarefa sem datas:', task);
            return false;
          }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(task.start) || !/^\d{4}-\d{2}-\d{2}$/.test(task.end)) {
            console.error('Tarefa com formato de data inválido:', task);
            return false;
          }
          return true;
        });

        if (validTasks.length === 0) {
          console.warn('Nenhuma tarefa válida após validação');
          setIsInitialized(false);
          return;
        }

        console.log('Inicializando Gantt com', validTasks.length, 'tarefas válidas');
        console.log('Tasks:', validTasks);
        
        // Garantir que todas as tarefas têm datas válidas antes de criar o Gantt
        const finalTasks = validTasks.map(task => {
          // Validar e normalizar datas uma última vez
          // Garantir formato YYYY-MM-DD
          const startStr = task.start.split('T')[0].substring(0, 10);
          const endStr = task.end.split('T')[0].substring(0, 10);
          
          const startDate = new Date(startStr + 'T00:00:00');
          const endDate = new Date(endStr + 'T23:59:59');
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Data inválida na tarefa:', task, startStr, endStr);
            return null;
          }

          // Validar formato YYYY-MM-DD
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(startStr) || !dateRegex.test(endStr)) {
            console.error('Formato de data inválido:', startStr, endStr);
            return null;
          }

          return {
            ...task,
            start: startStr,
            end: endStr,
          };
        }).filter((task): task is GanttTask => task !== null);

        if (finalTasks.length === 0) {
          console.error('Nenhuma tarefa válida após normalização final');
          setIsInitialized(false);
          return;
        }

        // Log das tarefas finais para debug
        console.log('Tarefas finais para Gantt:', finalTasks.map(t => ({
          id: t.id,
          name: t.name,
          start: t.start,
          end: t.end,
          startType: typeof t.start,
          endType: typeof t.end
        })));

        // Garantir que todas as datas estão no formato YYYY-MM-DD e são válidas
        const sanitizedTasks = finalTasks.map(task => {
          // Normalizar datas para formato YYYY-MM-DD
          let startStr = task.start.split('T')[0].substring(0, 10);
          let endStr = task.end.split('T')[0].substring(0, 10);
          
          // Validar formato
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(startStr) || !dateRegex.test(endStr)) {
            console.error('Formato de data inválido após sanitização:', startStr, endStr);
            return null;
          }
          
          // Validar que são datas válidas
          const startDate = new Date(startStr);
          const endDate = new Date(endStr);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Data inválida após sanitização:', startStr, endStr);
            return null;
          }
          
          return {
            ...task,
            start: startStr,
            end: endStr,
          };
        }).filter((task): task is GanttTask => task !== null);

        if (sanitizedTasks.length === 0) {
          console.error('Nenhuma tarefa válida após sanitização');
          setIsInitialized(false);
          return;
        }

        // Configuração do Gantt - habilitar edição de barras
        const ganttOptions: any = {
          view_mode: 'Month',
          header_height: 60,
          column_width: 60,
          step: 24,
          bar_height: 40,
          bar_corner_radius: 4,
          arrow_curve: 5,
          padding: 25,
          popup_trigger: 'click',
          readonly: false, // Habilitar edição de barras (arrastar e redimensionar)
          // Não definir date_format para usar o padrão do frappe-gantt
          on_click: (task: any) => {
            console.log('🖱️ Task clicked:', task);
          },
          on_date_change: async (task: any, start: Date, end: Date) => {
            // Log bem visível para garantir que está sendo chamado
            console.log('========================================');
            console.log('🔄 CALLBACK ON_DATE_CHANGE CHAMADO!');
            console.log('========================================');
            console.log('Task:', task);
            console.log('Task ID:', task._id || task.id);
            console.log('Task Name:', task._name || task.name);
            console.log('Start:', start);
            console.log('End:', end);
            console.log('📋 Estrutura completa do task:', JSON.stringify(task, null, 2));
            
            try {
              // O frappe-gantt pode passar o ID de diferentes formas
              // Tentar várias propriedades possíveis
              const taskId = task._id || task.id || task._name?.id || task.name?.id;
              
              console.log('🔍 Task ID encontrado:', taskId);
              console.log('🔍 Todas as propriedades do task:', Object.keys(task));
              
              if (!taskId) {
                console.error('❌ ID de tarefa não encontrado. Task completo:', task);
                // Tentar encontrar pelo nome da tarefa
                const taskName = task._name || task.name;
                if (taskName) {
                  const foundItem = itemsRef.current.find(item => item.atividade === taskName);
                  if (foundItem) {
                    console.log('✅ Item encontrado pelo nome:', foundItem);
                    const itemId = foundItem.id;
                    await updateItem(itemId, start, end, foundItem);
                    return;
                  }
                }
                return;
              }

              // Verificar se o ID tem o formato esperado
              let itemId: number;
              
              // Aceitar tanto 'item-X' quanto 'task-X' (para compatibilidade)
              if (typeof taskId === 'string') {
                if (taskId.startsWith('item-')) {
                  itemId = parseInt(taskId.replace('item-', ''));
                } else if (taskId.startsWith('task-')) {
                  // Se for formato antigo 'task-X', tentar encontrar pelo nome
                  const taskName = task._name || task.name;
                  if (taskName) {
                    const foundItem = itemsRef.current.find(item => item.atividade === taskName);
                    if (foundItem) {
                      console.log('✅ Item encontrado pelo nome (formato task-X):', foundItem);
                      itemId = foundItem.id;
                    } else {
                      // Tentar extrair número do ID task-X
                      const match = taskId.match(/\d+/);
                      if (match) {
                        // Buscar pelo índice (não ideal, mas funciona como fallback)
                        const index = parseInt(match[0]);
                        const sortedItems = [...itemsRef.current].sort((a, b) => {
                          const dateA = new Date(a.inicio);
                          const dateB = new Date(b.inicio);
                          return dateA.getTime() - dateB.getTime();
                        });
                        if (sortedItems[index]) {
                          itemId = sortedItems[index].id;
                          console.log('✅ Item encontrado pelo índice:', itemId);
                        } else {
                          console.error('❌ Índice inválido:', index);
                          return;
                        }
                      } else {
                        console.error('❌ Não foi possível extrair ID do item:', taskId);
                        return;
                      }
                    }
                  } else {
                    console.error('❌ Nome da tarefa não encontrado');
                    return;
                  }
                } else {
                  // Tentar extrair número do ID
                  const match = String(taskId).match(/\d+/);
                  if (match) {
                    itemId = parseInt(match[0]);
                  } else {
                    console.error('❌ Não foi possível extrair ID do item:', taskId);
                    return;
                  }
                }
              } else if (typeof taskId === 'number') {
                itemId = taskId;
              } else {
                console.error('❌ Formato de ID inválido:', taskId);
                return;
              }

              if (isNaN(itemId)) {
                console.error('❌ ID do item é NaN:', taskId);
                // Última tentativa: buscar pelo nome da tarefa
                const taskName = task._name || task.name;
                if (taskName) {
                  const foundItem = itemsRef.current.find(item => item.atividade === taskName);
                  if (foundItem) {
                    console.log('✅ Item encontrado pelo nome (fallback):', foundItem);
                    itemId = foundItem.id;
                  } else {
                    console.error('❌ Item não encontrado pelo nome:', taskName);
                    console.log('📋 Items disponíveis:', itemsRef.current.map(i => i.atividade));
                    return;
                  }
                } else {
                  return;
                }
              }

              console.log('✅ ID do item extraído:', itemId);

              // Encontrar o item original nos items (usar ref para ter sempre a versão atualizada)
              const originalItem = itemsRef.current.find(item => item.id === itemId);
              if (!originalItem) {
                console.error('❌ Item original não encontrado para ID:', itemId);
                console.log('📋 Items disponíveis:', itemsRef.current.map(i => ({ id: i.id, atividade: i.atividade })));
                return;
              }

              await updateItem(itemId, start, end, originalItem);
            } catch (error) {
              console.error('❌ Erro ao atualizar item no Gantt:', error);
            }
            
            // Função auxiliar para atualizar o item
            async function updateItem(itemId: number, start: Date, end: Date, originalItem: CronogramaItem) {
              // Formatar datas para YYYY-MM-DD
              const inicio = start.toISOString().split('T')[0];
              const fim = end.toISOString().split('T')[0];

              console.log('💾 Atualizando item:', { itemId, inicio, fim });
              console.log('💾 Item original:', originalItem);

              // Determinar o novo mês baseado na data de início
              const novoMes = getMonthFromDate(start);

              console.log('💾 Novo mês calculado:', novoMes);

              // Atualizar via Redux
              try {
                console.log('💾 Chamando dispatch...');
                
                // Marcar que estamos fazendo uma atualização programática
                isUpdatingRef.current = true;
                
                const result = await dispatch(editCronogramaItem({
                  id: itemId,
                  mes: novoMes,
                  atividade: originalItem.atividade,
                  categoria: originalItem.categoria,
                  inicio,
                  fim,
                })).unwrap();

                console.log('✅ Item atualizado com sucesso!');
                console.log('✅ Resultado:', result);
                console.log('✅ Dados salvos:', { id: itemId, inicio, fim, mes: novoMes });
                
                // A flag isUpdatingRef.current já está true, então o useEffect não reinicializará
                // O Gantt será atualizado quando o Redux atualizar os items, mas sem reinicialização completa
              } catch (dispatchError) {
                console.error('❌ Erro no dispatch:', dispatchError);
                console.error('❌ Stack trace:', (dispatchError as Error).stack);
                isUpdatingRef.current = false;
                throw dispatchError;
              }
            }
          },
          on_progress_change: (task: any, progress: number) => {
            console.log('Progress changed:', task, progress);
          },
          on_view_change: (mode: string) => {
            console.log('View mode changed:', mode);
          },
        };

        try {
          // Log para confirmar que o callback está sendo passado
          console.log('🔧 Criando Gantt com opções:', {
            tasksCount: sanitizedTasks.length,
            hasOnDateChange: typeof ganttOptions.on_date_change === 'function',
            readonly: ganttOptions.readonly
          });
          
          // Tentar criar o Gantt com tratamento de erro específico
          ganttInstance.current = new Gantt(ganttContainer.current, sanitizedTasks, ganttOptions);
          
          // Verificar se o callback foi registrado
          console.log('✅ Gantt criado. Verificando callbacks...');
        } catch (ganttError: any) {
          console.error('Erro ao criar instância do Gantt:', ganttError);
          console.error('Tarefas que causaram o erro:', sanitizedTasks);
          // Tentar novamente com configuração ainda mais básica
          try {
            const basicOptions: any = {
              view_mode: 'Month' as const,
              header_height: 60,
              column_width: 60,
              step: 24,
              bar_height: 40,
            };
            ganttInstance.current = new Gantt(ganttContainer.current, sanitizedTasks, basicOptions);
          } catch (retryError) {
            console.error('Erro ao criar Gantt mesmo com configuração básica:', retryError);
            throw retryError;
          }
        }
        
         // Ajustar o SVG para permitir scroll horizontal adequado, aplicar cores e traduzir meses
         setTimeout(() => {
           const svg = ganttContainer.current?.querySelector('svg');
           if (svg) {
             // Traduzir nomes dos meses no cabeçalho
             const monthNames: Record<string, string> = {
               'January': 'Janeiro',
               'February': 'Fevereiro',
               'March': 'Março',
               'April': 'Abril',
               'May': 'Maio',
               'June': 'Junho',
               'July': 'Julho',
               'August': 'Agosto',
               'September': 'Setembro',
               'October': 'Outubro',
               'November': 'Novembro',
               'December': 'Dezembro',
               // Abreviações também
               'Jan': 'Jan',
               'Feb': 'Fev',
               'Mar': 'Mar',
               'Apr': 'Abr',
               'Jun': 'Jun',
               'Jul': 'Jul',
               'Aug': 'Ago',
               'Sep': 'Set',
               'Oct': 'Out',
               'Nov': 'Nov',
               'Dec': 'Dez',
             };
             
             // Encontrar todos os textos do cabeçalho e traduzir
             const textElements = svg.querySelectorAll('text');
             textElements.forEach((textEl) => {
               const textContent = textEl.textContent?.trim() || '';
               if (monthNames[textContent]) {
                 textEl.textContent = monthNames[textContent];
               }
             });
             
             // Truncar textos das barras que ultrapassam o tamanho e aplicar clipPath
             const truncateBarLabels = () => {
               const barWrappers = svg.querySelectorAll('.bar-wrapper');
               
               barWrappers.forEach((barWrapper, index) => {
                 const barInner = barWrapper.querySelector('.bar-inner') as SVGRectElement;
                 const barLabel = barWrapper.querySelector('.bar-label text') as SVGTextElement;
                 
                 if (barInner && barLabel) {
                   const barWidth = parseFloat(barInner.getAttribute('width') || '0');
                   const barX = parseFloat(barInner.getAttribute('x') || '0');
                   const barY = parseFloat(barInner.getAttribute('y') || '0');
                   const barHeight = parseFloat(barInner.getAttribute('height') || '40');
                   const originalText = barLabel.textContent || '';
                   
                   if (barWidth > 0 && originalText.length > 0) {
                     // Criar clipPath para cada barra para garantir que o texto não ultrapasse
                     const clipId = `clip-bar-${index}`;
                     let clipPath = svg.querySelector(`#${clipId}`) as SVGClipPathElement;
                     
                     if (!clipPath) {
                       const defs = svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                       if (!svg.querySelector('defs')) {
                         svg.insertBefore(defs, svg.firstChild);
                       }
                       
                       clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
                       clipPath.setAttribute('id', clipId);
                       const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                       clipRect.setAttribute('x', String(barX));
                       clipRect.setAttribute('y', String(barY));
                       clipRect.setAttribute('width', String(barWidth));
                       clipRect.setAttribute('height', String(barHeight));
                       clipPath.appendChild(clipRect);
                       defs.appendChild(clipPath);
                     }
                     
                     // Aplicar clipPath ao grupo da barra
                     barWrapper.setAttribute('clip-path', `url(#${clipId})`);
                     
                     // Truncar o texto se necessário
                     const padding = 8;
                     const maxTextWidth = barWidth - (padding * 2);
                     
                     if (maxTextWidth > 0) {
                       // Criar elemento temporário para medir o texto
                       const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                       tempText.setAttribute('font-size', '13');
                       tempText.setAttribute('font-weight', '600');
                       tempText.setAttribute('x', barLabel.getAttribute('x') || '0');
                       tempText.setAttribute('y', barLabel.getAttribute('y') || '0');
                       tempText.textContent = originalText;
                       tempText.style.visibility = 'hidden';
                       tempText.style.position = 'absolute';
                       svg.appendChild(tempText);
                       
                       const textWidth = tempText.getBBox().width;
                       svg.removeChild(tempText);
                       
                       // Se o texto for maior que o espaço disponível, truncar
                       if (textWidth > maxTextWidth) {
                         // Calcular quantos caracteres cabem
                         let truncated = originalText;
                         let testWidth = textWidth;
                         let chars = originalText.length;
                         
                         // Busca binária para encontrar o melhor ponto de truncamento
                         while (testWidth > maxTextWidth && chars > 3) {
                           chars = Math.max(3, chars - 2);
                           truncated = originalText.substring(0, chars) + '...';
                           
                           tempText.textContent = truncated;
                           svg.appendChild(tempText);
                           testWidth = tempText.getBBox().width;
                           svg.removeChild(tempText);
                         }
                         
                         if (chars >= 3) {
                           barLabel.textContent = truncated;
                         } else if (barWidth > 30) {
                           barLabel.textContent = '...';
                         } else {
                           barLabel.style.display = 'none';
                         }
                       }
                       
                       // Usar textLength como fallback
                       barLabel.setAttribute('textLength', String(maxTextWidth));
                       barLabel.setAttribute('lengthAdjust', 'spacing');
                     } else {
                       barLabel.style.display = 'none';
                     }
                   }
                 }
               });
             };
             
             // Executar truncamento após um pequeno delay para garantir que o SVG está renderizado
             setTimeout(truncateBarLabels, 100);
             // Executar novamente após mais um delay para garantir
             setTimeout(truncateBarLabels, 300);
             
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
             sanitizedTasks.forEach((task) => {
               // Encontrar todas as barras relacionadas a esta tarefa
               const barGroups = svg.querySelectorAll(`g.bar-wrapper`);
               barGroups.forEach((barGroup, index) => {
                 if (index < sanitizedTasks.length && sanitizedTasks[index].id === task.id) {
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
               if (sanitizedTasks[index]) {
                 const task = sanitizedTasks[index];
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
  }, [items, dispatch]);

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

