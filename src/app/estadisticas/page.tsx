'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { BarChart3, TrendingUp, Users, Horse } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-gray-600 mt-1">Análisis de ocupación y rendimiento</p>
        </div>

        {/* Ocupación por Caballos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Horse className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Ocupación por Caballo</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ocupacionCaballos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clases_programadas" fill="#22c55e" name="Clases Programadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ocupación por Profesores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Ocupación por Profesor</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ocupacionProfesores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clases_programadas" fill="#3b82f6" name="Clases Programadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Caballos</h3>
            <div className="space-y-3">
              {ocupacionCaballos
                .sort((a, b) => b.clases_programadas - a.clases_programadas)
                .slice(0, 5)
                .map((caballo, index) => (
                  <div key={caballo.caballo_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{caballo.nombre}</span>
                    </div>
                    <span className="text-gray-600">{caballo.clases_programadas} clases</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Profesores</h3>
            <div className="space-y-3">
              {ocupacionProfesores
                .sort((a, b) => b.clases_programadas - a.clases_programadas)
                .slice(0, 5)
                .map((profesor, index) => (
                  <div key={profesor.profesor_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{profesor.nombre}</span>
                    </div>
                    <span className="text-gray-600">{profesor.clases_programadas} clases</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
