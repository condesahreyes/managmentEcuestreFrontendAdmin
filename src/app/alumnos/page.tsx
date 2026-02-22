'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Users, Ban, CheckCircle, Mail, Phone, Search, Plus, X, Package } from 'lucide-react';

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
  suscripciones: Array<{
    id: string;
    clases_incluidas: number;
    clases_usadas: number;
    fecha_fin: string;
    fecha_inicio: string;
    activa: boolean;
    planes: {
      id: string;
      nombre: string;
    };
  }>;
}

interface Plan {
  id: string;
  nombre: string;
  tipo: string;
  clases_mes: number;
  precio: number;
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarFormularioSuscripcion, setMostrarFormularioSuscripcion] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [suscripcionData, setSuscripcionData] = useState({
    plan_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAlumnos();
    loadPlanes();
  }, [filtroRol]);

  const loadAlumnos = async () => {
    try {
      const params: any = { activo: 'true' };
      if (filtroRol) {
        params.rol = filtroRol;
      }

      const { data } = await api.get('/admin/alumnos', { params });
      setAlumnos(data || []);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanes = async () => {
    try {
      const { data } = await api.get('/admin/planes');
      setPlanes(data || []);
    } catch (error) {
      console.error('Error al cargar planes:', error);
    }
  };

  const handleBloquear = async (id: string, activo: boolean) => {
    try {
      await api.patch(`/admin/alumnos/${id}/bloquear`, { activo: !activo });
      loadAlumnos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al actualizar estado');
    }
  };

  const handleAsignarSuscripcion = (alumno: Alumno) => {
    setAlumnoSeleccionado(alumno);
    setSuscripcionData({
      plan_id: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
    });
    setMostrarFormularioSuscripcion(true);
  };

  const handleSubmitSuscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumnoSeleccionado) return;

    try {
      await api.post(`/admin/alumnos/${alumnoSeleccionado.id}/suscripcion`, suscripcionData);
      alert('Suscripción asignada exitosamente');
      setMostrarFormularioSuscripcion(false);
      setAlumnoSeleccionado(null);
      loadAlumnos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al asignar suscripción');
    }
  };

  const planesFiltrados = planes.filter((plan) => {
    if (!alumnoSeleccionado) return false;
    return plan.tipo === alumnoSeleccionado.rol;
  });

  const alumnosFiltrados = alumnos.filter((alumno) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      alumno.nombre.toLowerCase().includes(search) ||
      alumno.apellido.toLowerCase().includes(search) ||
      alumno.email.toLowerCase().includes(search)
    );
  });

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
            <h1 className="font-serif text-3xl font-medium text-white">Alumnos</h1>
            <p className="text-white/60 mt-1">Gestiona los alumnos del centro</p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
              />
            </div>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
            >
              <option value="" className="bg-[#1a1a1a]">Todos los tipos</option>
              <option value="escuelita" className="bg-[#1a1a1a]">Escuelita</option>
              <option value="pension_completa" className="bg-[#1a1a1a]">Pensión Completa</option>
              <option value="media_pension" className="bg-[#1a1a1a]">Media Pensión</option>
            </select>
          </div>
        </div>

        {mostrarFormularioSuscripcion && alumnoSeleccionado && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-xl font-medium text-white">Asignar Suscripción</h2>
                <p className="text-sm text-white/60 mt-1">
                  {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
                </p>
              </div>
              <button
                onClick={() => {
                  setMostrarFormularioSuscripcion(false);
                  setAlumnoSeleccionado(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            <form onSubmit={handleSubmitSuscripcion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Plan</label>
                <select
                  required
                  value={suscripcionData.plan_id}
                  onChange={(e) => setSuscripcionData({ ...suscripcionData, plan_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                >
                  <option value="" className="bg-[#1a1a1a]">Selecciona un plan</option>
                  {planesFiltrados.map((plan) => (
                    <option key={plan.id} value={plan.id} className="bg-[#1a1a1a]">
                      {plan.nombre} - {plan.clases_mes} clases/mes - ${plan.precio.toFixed(2)}
                    </option>
                  ))}
                </select>
                {planesFiltrados.length === 0 && (
                  <p className="text-xs text-white/50 mt-1">
                    No hay planes disponibles para este tipo de alumno. Crea un plan primero.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Fecha de Inicio</label>
                <input
                  type="date"
                  required
                  value={suscripcionData.fecha_inicio}
                  onChange={(e) =>
                    setSuscripcionData({ ...suscripcionData, fecha_inicio: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
                >
                  Asignar Suscripción
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormularioSuscripcion(false);
                    setAlumnoSeleccionado(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {alumnosFiltrados.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-2">No se encontraron alumnos</p>
            <p className="text-white/40 text-sm">
              {searchTerm || filtroRol
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay alumnos registrados'}
            </p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Alumno
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider hidden md:table-cell">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider hidden lg:table-cell">
                      Suscripción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {alumnosFiltrados.map((alumno) => {
                    const suscripcion = alumno.suscripciones?.find((s) => s.activa) || alumno.suscripciones?.[0];
                    return (
                      <tr key={alumno.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">
                            {alumno.nombre} {alumno.apellido}
                          </div>
                          <div className="text-sm text-white/50 md:hidden mt-1">
                            {alumno.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-white/60 space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>{alumno.email}</span>
                            </div>
                            {alumno.telefono && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>{alumno.telefono}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 text-white border border-white/20">
                            {alumno.rol.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          {suscripcion ? (
                            <div className="text-sm">
                              <div className="font-medium text-white">
                                {suscripcion.planes?.nombre}
                              </div>
                              <div className="text-white/50">
                                {suscripcion.clases_usadas}/{suscripcion.clases_incluidas} clases
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-white/50">Sin suscripción</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                              alumno.activo
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'bg-red-500/20 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {alumno.activo ? 'Activo' : 'Bloqueado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAsignarSuscripcion(alumno)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg text-sm transition-all"
                              title="Asignar suscripción"
                            >
                              <Package className="w-4 h-4" />
                              <span className="hidden sm:inline">Suscripción</span>
                            </button>
                            <button
                              onClick={() => handleBloquear(alumno.id, alumno.activo)}
                              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                alumno.activo
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                              }`}
                            >
                              {alumno.activo ? (
                                <>
                                  <Ban className="w-4 h-4" />
                                  <span className="hidden sm:inline">Bloquear</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="hidden sm:inline">Activar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
