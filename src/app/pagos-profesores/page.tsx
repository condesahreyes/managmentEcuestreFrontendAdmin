'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PagoProfesor {
  profesor_id: string;
  mes: number;
  año: number;
  total_escuelita: number;
  total_pension: number;
  clases_escuelita: number;
  clases_pension: number;
  porcentaje_escuelita: number;
  porcentaje_pension: number;
  pago_escuelita: number;
  pago_pension: number;
  pago_total: number;
  profesor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
}

export default function PagosProfesoresPage() {
  const [pagos, setPagos] = useState<PagoProfesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());

  useEffect(() => {
    loadPagos();
  }, [mes, año]);

  const loadPagos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/pagos-profesores', {
        params: { mes, año },
      });
      setPagos(data || []);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const años = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const totalGeneral = pagos.reduce((sum, p) => sum + p.pago_total, 0);
  const totalEscuelita = pagos.reduce((sum, p) => sum + p.pago_escuelita, 0);
  const totalPension = pagos.reduce((sum, p) => sum + p.pago_pension, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-white">Pagos de Profesores</h1>
            <p className="text-white/60 mt-1">Cálculo mensual de pagos según suscripciones</p>
          </div>
          <div className="flex gap-3">
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 backdrop-blur-sm"
            >
              {meses.map((m, i) => (
                <option key={i} value={i + 1} className="bg-[#1a1a1a]">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={año}
              onChange={(e) => setAño(parseInt(e.target.value))}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 backdrop-blur-sm"
            >
              {años.map((a) => (
                <option key={a} value={a} className="bg-[#1a1a1a]">
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/60">Total General</span>
              <DollarSign className="w-5 h-5 text-white/40" />
            </div>
            <div className="text-2xl font-serif font-medium text-white">
              ${totalGeneral.toFixed(2)}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/60">Total Escuelita</span>
              <TrendingUp className="w-5 h-5 text-white/40" />
            </div>
            <div className="text-2xl font-serif font-medium text-white">
              ${totalEscuelita.toFixed(2)}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/60">Total Pensión</span>
              <TrendingUp className="w-5 h-5 text-white/40" />
            </div>
            <div className="text-2xl font-serif font-medium text-white">
              ${totalPension.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tabla de pagos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
          </div>
        ) : pagos.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No hay pagos registrados para este mes</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Profesor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      % Escuelita
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      % Pensión
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                      Suscripciones Escuelita
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                      Suscripciones Pensión
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                      Pago Escuelita
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                      Pago Pensión
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pagos.map((pago) => (
                    <tr key={pago.profesor_id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-white/40" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {pago.profesor
                                ? `${pago.profesor.nombre} ${pago.profesor.apellido}`
                                : 'Profesor no encontrado'}
                            </div>
                            {pago.profesor && (
                              <div className="text-xs text-white/50">{pago.profesor.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {pago.porcentaje_escuelita.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {pago.porcentaje_pension.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 text-right">
                        {pago.clases_escuelita}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 text-right">
                        {pago.clases_pension}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">
                        ${pago.pago_escuelita.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">
                        ${pago.pago_pension.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white text-right">
                        ${pago.pago_total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
