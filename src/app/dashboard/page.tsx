'use client';

import { useEffect, useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Calendar, Clock, User, Zap } from 'lucide-react';
import { Calendar as BigCalendar } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek,
  getDay,
  locales,
});

interface Clase {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  users: {
    nombre: string;
    apellido: string;
    email: string;
  };
  profesores: {
    users: {
      nombre: string;
      apellido: string;
    };
  };
  caballos: {
    nombre: string;
    tipo: string;
  };
}

export default function DashboardPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [date, setDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadAgenda();
  }, [date]);

  const loadAgenda = async () => {
    try {
      const inicio = format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
      const fin = format(
        new Date(date.getFullYear(), date.getMonth() + 1, 0),
        'yyyy-MM-dd'
      );

      const { data } = await api.get('/admin/agenda', {
        params: { fecha_inicio: inicio, fecha_fin: fin },
      });

      setClases(data || []);
    } catch (error) {
      console.error('Error al cargar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const events = useMemo(() => {
    return clases.map((clase) => {
      const start = parseISO(`${clase.fecha}T${clase.hora_inicio}`);
      const end = parseISO(`${clase.fecha}T${clase.hora_fin}`);

      return {
        id: clase.id,
        title: `${clase.users.nombre} ${clase.users.apellido} - ${clase.caballos.nombre}`,
        start,
        end,
        resource: clase,
      };
    });
  }, [clases]);

  const eventStyleGetter = (event: any) => {
    const clase = event.resource;
    let backgroundColor = 'rgba(255, 255, 255, 0.9)';
    let borderColor = 'rgba(255, 255, 255, 0.3)';

    if (clase.estado === 'completada') {
      backgroundColor = 'rgba(255, 255, 255, 0.5)';
      borderColor = 'rgba(255, 255, 255, 0.2)';
    } else if (clase.estado === 'cancelada') {
      backgroundColor = 'rgba(220, 38, 38, 0.8)';
      borderColor = 'rgba(220, 38, 38, 0.5)';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '6px',
        border: 'none',
        color: clase.estado === 'cancelada' ? '#ffffff' : '#0a0a0a',
        padding: '4px 6px',
        fontSize: '12px',
        fontWeight: 500,
      },
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-white">Agenda General</h1>
            <p className="text-white/60 mt-1">Vista completa de todas las clases programadas</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setView('month')}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm sm:text-base ${
                view === 'month'
                  ? 'bg-white text-[#0a0a0a] shadow-lg shadow-white/10'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm sm:text-base ${
                view === 'week'
                  ? 'bg-white text-[#0a0a0a] shadow-lg shadow-white/10'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm sm:text-base ${
                view === 'day'
                  ? 'bg-white text-[#0a0a0a] shadow-lg shadow-white/10'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              Día
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 overflow-hidden">
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <div style={{ minWidth: isMobile ? '100%' : '600px' }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                style={{ height: isMobile ? 400 : 600 }}
                messages={{
                  next: 'Siguiente',
                  previous: 'Anterior',
                  today: 'Hoy',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día',
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="font-serif text-xl font-medium text-white">Clases del Mes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {clases.slice(0, 10).map((clase) => (
                <div
                  key={clase.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-white/50" />
                        <span className="font-medium text-white">
                          {format(parseISO(clase.fecha), 'EEEE, dd MMMM', { locale: es })}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-white/60">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {clase.hora_inicio} - {clase.hora_fin}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>
                            {clase.users.nombre} {clase.users.apellido}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>{clase.caballos.nombre}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        clase.estado === 'programada'
                          ? 'bg-white/10 text-white border border-white/20'
                          : clase.estado === 'completada'
                          ? 'bg-white/5 text-white/60 border border-white/10'
                          : 'bg-red-500/20 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {clase.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
