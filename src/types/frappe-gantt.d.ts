declare module 'frappe-gantt' {
  interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string;
    custom_class?: string;
  }

  interface GanttOptions {
    view_mode?: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month' | 'Year';
    language?: string;
    header_height?: number;
    column_width?: number;
    step?: number;
    bar_height?: number;
    bar_corner_radius?: number;
    arrow_curve?: number;
    padding?: number;
    date_format?: string;
    popup_trigger?: 'click' | 'hover';
    on_click?: (task: GanttTask) => void;
    on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
    on_progress_change?: (task: GanttTask, progress: number) => void;
    on_view_change?: (mode: string) => void;
  }

  export default class Gantt {
    constructor(container: HTMLElement, tasks: GanttTask[], options?: GanttOptions);
    change_view_mode(mode: GanttOptions['view_mode']): void;
    refresh(tasks: GanttTask[]): void;
  }
}

