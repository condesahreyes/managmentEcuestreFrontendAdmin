'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { CheckCircle, XCircle, Clock, FileText, Eye, User, DollarSign, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comprobante {
  id: string;
  factura_id: string;
  archivo_url: string;
  nombre_archivo: string;
  tipo_archivo: string;
  monto: number;
  fecha_subida: string;
  estado: string;
  observaciones: string | null;
  users: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  facturas: {
    mes: number;
    año: number;
    monto: number;
    fecha_vencimiento: string;
  };
}

export default function ComprobantesPage() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'pendiente' | 'todos'>('pendiente');
  const [procesando, setProcesando] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadComprobantes();
  }, [filtroEstado]);

  const loadComprobantes = async () => {
    try {
      if (filtroEstado === 'pendiente') {
        const { data } = await api.get('/comprobantes/pendientes');
        setComprobantes(data || []);
      } else {
        // Cargar todos los comprobantes (necesitarías crear este endpoint)
        const { data } = await api.get('/comprobantes/pendientes');
        setComprobantes(data || []);
      }
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (comprobanteId: string) => {
    if (!confirm('¿Confirmas que el comprobante es válido y el monto coincide?')) return;

    setProcesando(comprobanteId);
    try {
      await api.post(`/comprobantes/${comprobanteId}/aprobar`);
      alert('Comprobante aprobado exitosamente. La factura ha sido marcada como pagada.');
      loadComprobantes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al aprobar comprobante');
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (comprobanteId: string) => {
    const obs = observaciones[comprobanteId] || '';
    if (!obs.trim()) {
      alert('Debes ingresar una observación explicando por qué se rechaza el comprobante');
      return;
    }

    if (!confirm('¿Confirmas que deseas rechazar este comprobante?')) return;

    setProcesando(comprobanteId);
    try {
      await api.post(`/comprobantes/${comprobanteId}/rechazar`, {
        observaciones: obs,
      });
      alert('Comprobante rechazado. El usuario deberá subir un nuevo comprobante.');
      setObservaciones({ ...observaciones, [comprobanteId]: '' });
      loadComprobantes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al rechazar comprobante');
    } finally {
      setProcesando(null);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'rechazado':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="w-4 h-4" />;
      case 'rechazado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
      <div className="px-5 pt-7 space-y-6">
        <div className="anim a1">
          <h1 className="font-serif text-[28px] font-medium text-white">Comprobantes de Pago</h1>
          <p className="text-sm text-white/60 mt-1">
            Revisa y aprueba los comprobantes de pago subidos por los alumnos
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 anim a2">
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={() => setFiltroEstado('pendiente')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filtroEstado === 'pendiente'
                  ? 'bg-white text-[#0a0a0a] shadow-lg shadow-white/10'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filtroEstado === 'todos'
                  ? 'bg-white text-[#0a0a0a] shadow-lg shadow-white/10'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Todos
            </button>
          </div>

          {comprobantes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-2">No hay comprobantes pendientes</p>
              <p className="text-white/40 text-sm">
                Los alumnos subirán sus comprobantes aquí para revisión
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comprobantes.map((comprobante) => (
                <div
                  key={comprobante.id}
                  className="border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-white/70" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {comprobante.users.nombre} {comprobante.users.apellido}
                          </h3>
                          <p className="text-sm text-white/50">{comprobante.users.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-white/50" />
                          <span className="text-white/70">
                            Mes:{' '}
                            {format(
                              new Date(comprobante.facturas.año, comprobante.facturas.mes - 1, 1),
                              'MMMM yyyy',
                              { locale: es }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <DollarSign className="w-4 h-4 text-white/50" />
                          <span className="text-white/70">
                            Monto: ${comprobante.monto.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <FileText className="w-4 h-4 text-white/50" />
                          <span className="text-white/70">{comprobante.nombre_archivo}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-white/50" />
                          <span className="text-white/70">
                            Subido:{' '}
                            {format(parseISO(comprobante.fecha_subida), 'dd MMM yyyy HH:mm', {
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border text-xs ${getEstadoColor(
                            comprobante.estado
                          )}`}
                        >
                          {getEstadoIcon(comprobante.estado)}
                          <span className="capitalize">{comprobante.estado}</span>
                        </span>
                      </div>

                      {comprobante.observaciones && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                          <p className="text-sm text-red-400">
                            <strong>Observaciones:</strong> {comprobante.observaciones}
                          </p>
                        </div>
                      )}

                      {comprobante.estado === 'pendiente' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                              Observaciones (requerido para rechazar)
                            </label>
                            <textarea
                              value={observaciones[comprobante.id] || ''}
                              onChange={(e) =>
                                setObservaciones({
                                  ...observaciones,
                                  [comprobante.id]: e.target.value,
                                })
                              }
                              placeholder="Explica por qué se rechaza el comprobante..."
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="flex space-x-3">
                            <a
                              href={comprobante.archivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-all font-medium flex items-center justify-center space-x-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Ver Comprobante</span>
                            </a>
                            <button
                              onClick={() => handleRechazar(comprobante.id)}
                              disabled={procesando === comprobante.id}
                              className="flex-1 px-4 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-all font-medium disabled:opacity-50"
                            >
                              {procesando === comprobante.id ? 'Rechazando...' : 'Rechazar'}
                            </button>
                            <button
                              onClick={() => handleAprobar(comprobante.id)}
                              disabled={procesando === comprobante.id}
                              className="flex-1 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10 disabled:opacity-50"
                            >
                              {procesando === comprobante.id ? 'Aprobando...' : 'Aprobar'}
                            </button>
                          </div>
                        </div>
                      )}

                      {comprobante.estado !== 'pendiente' && (
                        <a
                          href={comprobante.archivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-all font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Comprobante</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
