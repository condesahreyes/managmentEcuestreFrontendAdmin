declare module 'react-big-calendar' {
  import { ComponentType } from 'react';
  import { DateInput } from 'react-big-calendar';

  export interface Event {
    id?: string | number;
    title: string;
    start: Date;
    end: Date;
    resource?: any;
  }

  export interface CalendarProps {
    localizer: any;
    events: Event[];
    startAccessor: string;
    endAccessor: string;
    view?: 'month' | 'week' | 'day';
    onView?: (view: 'month' | 'week' | 'day') => void;
    date?: Date;
    onNavigate?: (date: Date) => void;
    eventPropGetter?: (event: Event) => { style?: React.CSSProperties };
    style?: React.CSSProperties;
    messages?: {
      next?: string;
      previous?: string;
      today?: string;
      month?: string;
      week?: string;
      day?: string;
    };
  }

  export const Calendar: ComponentType<CalendarProps>;
  export function dateFnsLocalizer(config: any): any;
}
