'use client';

import { useEffect, useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Calendar, Clock, User, Horse } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay } from 'date-fns';
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

  useEffect(() => {
    loadAgenda();
  }, []);

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
    let backgroundColor = '#22c55e'; // Verde por defecto

    if (clase.estado === 'completada') {
      backgroundColor = '#6b7280'; // Gris
    } else if (clase.estado === 'cancelada') {
      backgroundColor = '#ef4444'; // Rojo
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        padding: '2px 4px',
      },
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda General</h1>
            <p className="text-gray-600 mt-1">Vista completa de todas las clases programadas</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg ${
                view === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg ${
                view === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg ${
                view === 'day'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Día
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            style={{ height: 600 }}
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

        {/* Lista de clases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Clases del Mes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {clases.slice(0, 10).map((clase) => (
                <div
                  key={clase.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {format(parseISO(clase.fecha), 'EEEE, dd MMMM', { locale: es })}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
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
                          <Horse className="w-4 h-4" />
                          <span>{clase.caballos.nombre}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        clase.estado === 'programada'
                          ? 'bg-green-100 text-green-800'
                          : clase.estado === 'completada'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
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
