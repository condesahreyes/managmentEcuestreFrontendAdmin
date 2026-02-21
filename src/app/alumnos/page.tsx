'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Users, Ban, CheckCircle, Mail, Phone } from 'lucide-react';

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
  suscripciones: Array<{
    clases_incluidas: number;
    clases_usadas: number;
    fecha_fin: string;
    planes: {
      nombre: string;
    };
  }>;
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState<string>('');

  useEffect(() => {
    loadAlumnos();
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

  const handleBloquear = async (id: string, activo: boolean) => {
    try {
      await api.patch(`/admin/alumnos/${id}/bloquear`, { activo: !activo });
      loadAlumnos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al actualizar estado');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alumnos</h1>
            <p className="text-gray-600 mt-1">Gestiona los alumnos del centro</p>
          </div>
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los tipos</option>
            <option value="escuelita">Escuelita</option>
            <option value="pension_completa">Pensión Completa</option>
            <option value="media_pension">Media Pensión</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suscripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alumnos.map((alumno) => {
                  const suscripcion = alumno.suscripciones?.[0];
                  return (
                    <tr key={alumno.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {alumno.nombre} {alumno.apellido}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 space-y-1">
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
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {alumno.rol.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {suscripcion ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {suscripcion.planes?.nombre}
                            </div>
                            <div className="text-gray-600">
                              {suscripcion.clases_usadas}/{suscripcion.clases_incluidas} clases
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin suscripción</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            alumno.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {alumno.activo ? 'Activo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleBloquear(alumno.id, alumno.activo)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                            alumno.activo
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {alumno.activo ? (
                            <>
                              <Ban className="w-4 h-4" />
                              <span>Bloquear</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Activar</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
