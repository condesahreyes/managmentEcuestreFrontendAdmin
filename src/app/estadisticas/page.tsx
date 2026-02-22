'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { BarChart3, TrendingUp, Users } from 'lucide-react';
import Logo from '@/components/Logo';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function EstadisticasPage() {
  const [ocupacionCaballos, setOcupacionCaballos] = useState<any[]>([]);
  const [ocupacionProfesores, setOcupacionProfesores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    try {
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      const fechaFin = new Date();

      const [caballosRes, profesoresRes] = await Promise.all([
        api.get('/admin/ocupacion/caballos', {
          params: {
            fecha_inicio: fechaInicio.toISOString().split('T')[0],
            fecha_fin: fechaFin.toISOString().split('T')[0],
          },
        }),
        api.get('/admin/ocupacion/profesores', {
          params: {
            fecha_inicio: fechaInicio.toISOString().split('T')[0],
            fecha_fin: fechaFin.toISOString().split('T')[0],
          },
        }),
      ]);

      setOcupacionCaballos(caballosRes.data || []);
      setOcupacionProfesores(profesoresRes.data || []);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
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
        <div>
          <h1 className="font-serif text-3xl font-medium text-white">Estadísticas</h1>
          <p className="text-white/60 mt-1">Análisis de ocupación y rendimiento</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Logo className="w-6 h-6 text-white" />
            <h2 className="font-serif text-xl font-medium text-white">Ocupación por Caballo</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ocupacionCaballos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="nombre" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ color: '#ffffff' }} />
              <Bar dataKey="clases_programadas" fill="rgba(255,255,255,0.9)" name="Clases Programadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-white" />
            <h2 className="font-serif text-xl font-medium text-white">Ocupación por Profesor</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ocupacionProfesores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="nombre" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ color: '#ffffff' }} />
              <Bar dataKey="clases_programadas" fill="rgba(255,255,255,0.7)" name="Clases Programadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="font-serif text-lg font-medium text-white mb-4">Top 5 Caballos</h3>
            <div className="space-y-3">
              {ocupacionCaballos
                .sort((a, b) => b.clases_programadas - a.clases_programadas)
                .slice(0, 5)
                .map((caballo, index) => (
                  <div key={caballo.caballo_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center text-xs font-semibold border border-white/20">
                        {index + 1}
                      </span>
                      <span className="font-medium text-white">{caballo.nombre}</span>
                    </div>
                    <span className="text-white/60">{caballo.clases_programadas} clases</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="font-serif text-lg font-medium text-white mb-4">Top 5 Profesores</h3>
            <div className="space-y-3">
              {ocupacionProfesores
                .sort((a, b) => b.clases_programadas - a.clases_programadas)
                .slice(0, 5)
                .map((profesor, index) => (
                  <div key={profesor.profesor_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center text-xs font-semibold border border-white/20">
                        {index + 1}
                      </span>
                      <span className="font-medium text-white">{profesor.nombre}</span>
                    </div>
                    <span className="text-white/60">{profesor.clases_programadas} clases</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
