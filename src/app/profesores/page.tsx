'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { User, Plus, Edit, Trash2, X, Mail, Phone, Clock, Eye } from 'lucide-react';

interface Profesor {
  id: string;
  activo: boolean;
  users: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    activo: boolean;
  };
}

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [profesorEditando, setProfesorEditando] = useState<Profesor | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  });
  const [horarios, setHorarios] = useState<Array<{
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
  }>>([]);
  const [profesorDetalle, setProfesorDetalle] = useState<Profesor | null>(null);
  const [horariosDetalle, setHorariosDetalle] = useState<Array<{
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean;
  }>>([]);

  useEffect(() => {
    loadProfesores();
  }, []);

  const loadProfesores = async () => {
    try {
      const { data } = await api.get('/admin/profesores');
      setProfesores(data || []);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (profesorEditando) {
        // Editar profesor existente
        await api.patch(`/admin/profesores/${profesorEditando.id}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          horarios: horarios,
        });
        setMostrarFormulario(false);
        setProfesorEditando(null);
        setFormData({ nombre: '', apellido: '', email: '', telefono: '' });
        setHorarios([]);
        loadProfesores();
        alert('Profesor actualizado exitosamente');
      } else {
        // Crear nuevo profesor
        const { data } = await api.post('/admin/profesores', {
          ...formData,
          horarios: horarios,
        });
        setMostrarFormulario(false);
        setFormData({ nombre: '', apellido: '', email: '', telefono: '' });
        setHorarios([]);
        loadProfesores();
        alert(
          `Profesor creado exitosamente.\n\n` +
          `Email: ${formData.email}\n` +
          `Contraseña por defecto: ${data.password || '123456'}\n\n` +
          `El profesor puede cambiar su contraseña desde su perfil.`
        );
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al guardar profesor');
    }
  };

  const handleEditar = async (profesor: Profesor) => {
    try {
      // Cargar horarios del profesor
      const { data: horariosData } = await api.get(`/admin/profesores/${profesor.id}/horarios`);
      
      setProfesorEditando(profesor);
      setFormData({
        nombre: profesor.users?.nombre || '',
        apellido: profesor.users?.apellido || '',
        email: profesor.users?.email || '',
        telefono: profesor.users?.telefono || '',
      });
      setHorarios(horariosData || []);
      setMostrarFormulario(true);
    } catch (error: any) {
      console.error('Error al cargar datos del profesor:', error);
      // Si falla cargar horarios, continuar con la edición sin ellos
      setProfesorEditando(profesor);
      setFormData({
        nombre: profesor.users?.nombre || '',
        apellido: profesor.users?.apellido || '',
        email: profesor.users?.email || '',
        telefono: profesor.users?.telefono || '',
      });
      setHorarios([]);
      setMostrarFormulario(true);
    }
  };

  const agregarHorario = () => {
    setHorarios([...horarios, { dia_semana: 1, hora_inicio: '09:00', hora_fin: '10:00' }]);
  };

  const eliminarHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const actualizarHorario = (index: number, campo: string, valor: any) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index] = { ...nuevosHorarios[index], [campo]: valor };
    setHorarios(nuevosHorarios);
  };

  const diasSemana = [
    { valor: 0, nombre: 'Domingo' },
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
  ];

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este profesor?')) return;

    try {
      await api.delete(`/admin/profesores/${id}`);
      loadProfesores();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar profesor');
    }
  };

  const handleToggleActivo = async (profesor: Profesor) => {
    try {
      await api.patch(`/admin/profesores/${profesor.id}`, {
        activo: !profesor.activo,
      });
      loadProfesores();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al actualizar estado');
    }
  };

  const handleVerDetalle = async (profesor: Profesor) => {
    try {
      // Cargar horarios del profesor
      const { data: horariosData } = await api.get(`/admin/profesores/${profesor.id}/horarios`);
      setHorariosDetalle(horariosData || []);
      setProfesorDetalle(profesor);
    } catch (error: any) {
      console.error('Error al cargar detalles del profesor:', error);
      // Si falla cargar horarios, mostrar solo la info básica
      setHorariosDetalle([]);
      setProfesorDetalle(profesor);
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
            <h1 className="font-serif text-3xl font-medium text-white">Profesores</h1>
            <p className="text-white/60 mt-1">Gestiona los profesores del centro</p>
          </div>
          <button
            onClick={() => {
              setProfesorEditando(null);
              setFormData({ nombre: '', apellido: '', email: '', telefono: '' });
              setHorarios([]);
              setMostrarFormulario(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Profesor</span>
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-medium text-white">
                {profesorEditando ? 'Editar Profesor' : 'Nuevo Profesor'}
              </h2>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setProfesorEditando(null);
                  setHorarios([]);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  />
                </div>
              </div>
              {!profesorEditando && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Se enviará un email para que el profesor configure su contraseña
                  </p>
                </div>
              )}
              {profesorEditando && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed backdrop-blur-sm"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    El email no se puede modificar
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white/70">Horarios de Disponibilidad</label>
                  <button
                    type="button"
                    onClick={agregarHorario}
                    className="text-sm px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
                {horarios.length === 0 ? (
                  <p className="text-xs text-white/50 italic">No hay horarios definidos. El profesor estará disponible en todos los horarios.</p>
                ) : (
                  <div className="space-y-3">
                    {horarios.map((horario, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/70">Horario {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => eliminarHorario(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-white/60 mb-1">Día</label>
                            <select
                              value={horario.dia_semana}
                              onChange={(e) => actualizarHorario(index, 'dia_semana', parseInt(e.target.value))}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                            >
                              {diasSemana.map((dia) => (
                                <option key={dia.valor} value={dia.valor} className="bg-[#1a1a1a]">
                                  {dia.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-white/60 mb-1">Hora Inicio</label>
                            <input
                              type="time"
                              value={horario.hora_inicio}
                              onChange={(e) => actualizarHorario(index, 'hora_inicio', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-white/60 mb-1">Hora Fin</label>
                            <input
                              type="time"
                              value={horario.hora_fin}
                              onChange={(e) => actualizarHorario(index, 'hora_fin', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
                >
                  {profesorEditando ? 'Actualizar Profesor' : 'Crear Profesor'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setProfesorEditando(null);
                    setHorarios([]);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Profesor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider hidden md:table-cell">
                    Contacto
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
                {profesores.map((profesor) => (
                  <tr key={profesor.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">
                        {profesor.users?.nombre} {profesor.users?.apellido}
                      </div>
                      <div className="text-sm text-white/50 md:hidden mt-1">
                        {profesor.users?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-white/60 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{profesor.users?.email}</span>
                        </div>
                        {profesor.users?.telefono && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{profesor.users?.telefono}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                          profesor.activo && profesor.users?.activo
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-red-500/20 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {profesor.activo && profesor.users?.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleVerDetalle(profesor)}
                          className="px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg text-sm transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditar(profesor)}
                          className="px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg text-sm transition-all"
                          title="Editar profesor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActivo(profesor)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            profesor.activo && profesor.users?.activo
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                          }`}
                        >
                          {profesor.activo && profesor.users?.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleEliminar(profesor.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm transition-all"
                          title="Eliminar profesor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalles del Profesor */}
        {profesorDetalle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">
                    {profesorDetalle.users?.nombre} {profesorDetalle.users?.apellido}
                  </h2>
                  <p className="text-white/60 mt-1">Detalles del Profesor</p>
                </div>
                <button
                  onClick={() => {
                    setProfesorDetalle(null);
                    setHorariosDetalle([]);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Información Personal */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Información Personal</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">Nombre</p>
                      <p className="text-white">{profesorDetalle.users?.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">Apellido</p>
                      <p className="text-white">{profesorDetalle.users?.apellido}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1 flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </p>
                      <p className="text-white">{profesorDetalle.users?.email}</p>
                    </div>
                    {profesorDetalle.users?.telefono && (
                      <div>
                        <p className="text-xs font-medium text-white/50 mb-1 flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>Teléfono</span>
                        </p>
                        <p className="text-white">{profesorDetalle.users?.telefono}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">Estado</p>
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg ${
                          profesorDetalle.activo && profesorDetalle.users?.activo
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-red-500/20 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {profesorDetalle.activo && profesorDetalle.users?.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Horarios de Disponibilidad */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Horarios de Disponibilidad</span>
                  </h3>
                  {horariosDetalle.length === 0 ? (
                    <p className="text-sm text-white/50 italic">
                      No hay horarios definidos. El profesor está disponible en todos los horarios.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {horariosDetalle
                        .filter((h) => h.activo)
                        .map((horario, index) => (
                          <div
                            key={index}
                            className="bg-white/5 border border-white/10 rounded-lg p-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs font-medium text-white/50 mb-1">Día</p>
                                <p className="text-white">
                                  {diasSemana.find((d) => d.valor === horario.dia_semana)?.nombre || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-white/50 mb-1">Hora Inicio</p>
                                <p className="text-white">{horario.hora_inicio}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-white/50 mb-1">Hora Fin</p>
                                <p className="text-white">{horario.hora_fin}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex space-x-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setProfesorDetalle(null);
                      setHorariosDetalle([]);
                      handleEditar(profesorDetalle);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xl transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar Profesor</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfesorDetalle(null);
                      setHorariosDetalle([]);
                    }}
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
