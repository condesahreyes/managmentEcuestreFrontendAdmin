'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2, X, User, Eye } from 'lucide-react';
import Logo from '@/components/Logo';

interface Caballo {
  id: string;
  nombre: string;
  tipo: string;
  estado: string;
  limite_clases_dia: number;
  activo: boolean;
  dueno_id?: string;
  dueno?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface Dueno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export default function CaballosPage() {
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [duenos, setDuenos] = useState<Dueno[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [caballoEditando, setCaballoEditando] = useState<Caballo | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'escuela',
    estado: 'activo',
    limite_clases_dia: 3,
    dueno_id: '',
  });
  const [caballoDetalle, setCaballoDetalle] = useState<Caballo | null>(null);

  useEffect(() => {
    loadCaballos();
    loadDuenos();
  }, []);

  const loadCaballos = async () => {
    try {
      const { data } = await api.get('/admin/caballos');
      setCaballos(data || []);
    } catch (error) {
      console.error('Error al cargar caballos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDuenos = async () => {
    try {
      const { data } = await api.get('/admin/duenos');
      setDuenos(data || []);
    } catch (error) {
      console.error('Error al cargar dueños:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (submitData.tipo === 'escuela') {
        submitData.dueno_id = '';
      }
      if (caballoEditando) {
        await api.patch(`/admin/caballos/${caballoEditando.id}`, submitData);
      } else {
        await api.post('/admin/caballos', submitData);
      }
      setMostrarFormulario(false);
      setCaballoEditando(null);
      setFormData({ nombre: '', tipo: 'escuela', estado: 'activo', limite_clases_dia: 3, dueno_id: '' });
      loadCaballos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al guardar caballo');
    }
  };

  const handleEditar = (caballo: Caballo) => {
    setCaballoEditando(caballo);
    setFormData({
      nombre: caballo.nombre,
      tipo: caballo.tipo,
      estado: caballo.estado,
      limite_clases_dia: caballo.limite_clases_dia,
      dueno_id: caballo.dueno_id || '',
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este caballo?')) return;

    try {
      await api.delete(`/admin/caballos/${id}`);
      loadCaballos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar caballo');
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      await api.patch(`/admin/caballos/${id}/estado`, { estado: nuevoEstado });
      loadCaballos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const handleVerDetalle = (caballo: Caballo) => {
    setCaballoDetalle(caballo);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return {
          bg: 'bg-white/10',
          text: 'text-white',
          border: 'border-white/20',
        };
      case 'descanso':
        return {
          bg: 'bg-white/5',
          text: 'text-white/80',
          border: 'border-white/10',
        };
      case 'lesionado':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/20',
        };
      default:
        return {
          bg: 'bg-white/5',
          text: 'text-white/60',
          border: 'border-white/10',
        };
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-medium text-white">Caballos</h1>
            <p className="text-white/60 mt-1">Gestiona los caballos del centro</p>
          </div>
          <button
            onClick={() => {
              setCaballoEditando(null);
              setFormData({ nombre: '', tipo: 'escuela', estado: 'activo', limite_clases_dia: 3, dueno_id: '' });
              setMostrarFormulario(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Caballo</span>
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-medium text-white">
                {caballoEditando ? 'Editar Caballo' : 'Nuevo Caballo'}
              </h2>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setCaballoEditando(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tipo</label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value;
                      setFormData({
                        ...formData,
                        tipo: nuevoTipo,
                        dueno_id: nuevoTipo === 'escuela' ? '' : formData.dueno_id,
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  >
                    <option value="escuela" className="bg-[#1a1a1a]">Escuela</option>
                    <option value="privado" className="bg-[#1a1a1a]">Privado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Estado</label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  >
                    <option value="activo" className="bg-[#1a1a1a]">Activo</option>
                    <option value="descanso" className="bg-[#1a1a1a]">Descanso</option>
                    <option value="lesionado" className="bg-[#1a1a1a]">Lesionado</option>
                  </select>
                </div>
              </div>
              {formData.tipo === 'privado' && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Dueño <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.dueno_id}
                    onChange={(e) => setFormData({ ...formData, dueno_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  >
                    <option value="" className="bg-[#1a1a1a]">Selecciona un dueño</option>
                    {duenos.map((dueno) => (
                      <option key={dueno.id} value={dueno.id} className="bg-[#1a1a1a]">
                        {dueno.nombre} {dueno.apellido} ({dueno.email})
                      </option>
                    ))}
                  </select>
                  {duenos.length === 0 && (
                    <p className="text-xs text-white/50 mt-1">
                      No hay alumnos de pensión disponibles. Crea alumnos de pensión completa o media pensión primero.
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Límite de Clases por Día
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.limite_clases_dia}
                  onChange={(e) =>
                    setFormData({ ...formData, limite_clases_dia: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
                >
                  {caballoEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setCaballoEditando(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caballos.map((caballo) => {
            const estadoStyle = getEstadoColor(caballo.estado);
            return (
              <div
                key={caballo.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <Logo className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{caballo.nombre}</h3>
                      <p className="text-sm text-white/50">
                        {caballo.tipo === 'escuela' ? 'Escuela' : 'Privado'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${estadoStyle.bg} ${estadoStyle.text} ${estadoStyle.border}`}
                  >
                    {caballo.estado}
                  </span>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Límite diario:</span>
                    <span className="font-medium text-white">
                      {caballo.limite_clases_dia} clases
                    </span>
                  </div>
                  {caballo.tipo === 'privado' && caballo.dueno && (
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-white/50" />
                      <span className="text-white/60">Dueño:</span>
                      <span className="font-medium text-white">
                        {caballo.dueno.nombre} {caballo.dueno.apellido}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">
                      Cambiar Estado:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleCambiarEstado(caballo.id, 'activo')}
                        className={`px-3 py-2 text-xs rounded-lg transition-all ${
                          caballo.estado === 'activo'
                            ? 'bg-white text-[#0a0a0a] font-semibold shadow-lg shadow-white/10'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        Activo
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(caballo.id, 'descanso')}
                        className={`px-3 py-2 text-xs rounded-lg transition-all ${
                          caballo.estado === 'descanso'
                            ? 'bg-white/20 text-white font-semibold border border-white/30'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        Descanso
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(caballo.id, 'lesionado')}
                        className={`px-3 py-2 text-xs rounded-lg transition-all ${
                          caballo.estado === 'lesionado'
                            ? 'bg-red-500/30 text-red-400 font-semibold border border-red-500/30'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        Lesionado
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleVerDetalle(caballo)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">Ver</span>
                    </button>
                    <button
                      onClick={() => handleEditar(caballo)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-xs">Editar</span>
                    </button>
                    <button
                      onClick={() => handleEliminar(caballo.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Detalles del Caballo */}
        {caballoDetalle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Logo className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl md:text-2xl font-medium text-white">
                      {caballoDetalle.nombre}
                    </h2>
                    <p className="text-white/60 mt-1 text-sm">Detalles del Caballo</p>
                  </div>
                </div>
                <button
                  onClick={() => setCaballoDetalle(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* Información General */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5">
                  <h3 className="font-medium text-white mb-3 md:mb-4">Información General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">Nombre</p>
                      <p className="text-white text-sm md:text-base">{caballoDetalle.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">Tipo</p>
                      <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 text-white border border-white/20">
                        {caballoDetalle.tipo === 'escuela' ? 'Escuela' : 'Privado'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">Estado</p>
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg border ${
                          getEstadoColor(caballoDetalle.estado).bg
                        } ${getEstadoColor(caballoDetalle.estado).text} ${
                          getEstadoColor(caballoDetalle.estado).border
                        }`}
                      >
                        {caballoDetalle.estado}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">Límite de Clases por Día</p>
                      <p className="text-white text-sm md:text-base">
                        {caballoDetalle.limite_clases_dia} clases
                      </p>
                    </div>
                    {caballoDetalle.tipo === 'privado' && caballoDetalle.dueno && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-white/50 mb-1 flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>Dueño</span>
                        </p>
                        <div className="mt-1">
                          <p className="text-white text-sm md:text-base">
                            {caballoDetalle.dueno.nombre} {caballoDetalle.dueno.apellido}
                          </p>
                          <p className="text-white/60 text-xs mt-0.5">{caballoDetalle.dueno.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cambiar Estado */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5">
                  <h3 className="font-medium text-white mb-3 md:mb-4">Cambiar Estado</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        handleCambiarEstado(caballoDetalle.id, 'activo');
                        setCaballoDetalle({ ...caballoDetalle, estado: 'activo' });
                      }}
                      className={`px-3 py-2 text-xs rounded-lg transition-all ${
                        caballoDetalle.estado === 'activo'
                          ? 'bg-white text-[#0a0a0a] font-semibold shadow-lg shadow-white/10'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Activo
                    </button>
                    <button
                      onClick={() => {
                        handleCambiarEstado(caballoDetalle.id, 'descanso');
                        setCaballoDetalle({ ...caballoDetalle, estado: 'descanso' });
                      }}
                      className={`px-3 py-2 text-xs rounded-lg transition-all ${
                        caballoDetalle.estado === 'descanso'
                          ? 'bg-white/20 text-white font-semibold border border-white/30'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Descanso
                    </button>
                    <button
                      onClick={() => {
                        handleCambiarEstado(caballoDetalle.id, 'lesionado');
                        setCaballoDetalle({ ...caballoDetalle, estado: 'lesionado' });
                      }}
                      className={`px-3 py-2 text-xs rounded-lg transition-all ${
                        caballoDetalle.estado === 'lesionado'
                          ? 'bg-red-500/30 text-red-400 font-semibold border border-red-500/30'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Lesionado
                    </button>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setCaballoDetalle(null);
                      handleEditar(caballoDetalle);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xl transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar Caballo</span>
                  </button>
                  <button
                    onClick={() => {
                      setCaballoDetalle(null);
                      handleEliminar(caballoDetalle.id);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                  <button
                    onClick={() => setCaballoDetalle(null)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
