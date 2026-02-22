'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { User, Plus, Edit, Trash2, X, Mail, Phone } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  });

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
      const { data } = await api.post('/admin/profesores', formData);
      setMostrarFormulario(false);
      setFormData({ nombre: '', apellido: '', email: '', telefono: '' });
      loadProfesores();
      alert(
        `Profesor creado exitosamente.\n\n` +
        `Email: ${formData.email}\n` +
        `Contraseña por defecto: ${data.password || '123456'}\n\n` +
        `El profesor puede cambiar su contraseña desde su perfil.`
      );
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al crear profesor');
    }
  };

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
              setFormData({ nombre: '', apellido: '', email: '', telefono: '' });
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
              <h2 className="font-serif text-xl font-medium text-white">Nuevo Profesor</h2>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
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
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
                >
                  Crear Profesor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
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
      </div>
    </Layout>
  );
}
