'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Horse, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Caballo {
  id: string;
  nombre: string;
  tipo: string;
  estado: string;
  limite_clases_dia: number;
  activo: boolean;
}

export default function CaballosPage() {
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaballos();
  }, []);

  const loadCaballos = async () => {
    try {
      const { data } = await api.get('/caballos/disponibles');
      setCaballos(data || []);
    } catch (error) {
      console.error('Error al cargar caballos:', error);
    } finally {
      setLoading(false);
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'descanso':
        return 'bg-yellow-100 text-yellow-800';
      case 'lesionado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Caballos</h1>
          <p className="text-gray-600 mt-1">Gestiona el estado de los caballos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caballos.map((caballo) => (
            <div
              key={caballo.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Horse className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{caballo.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      {caballo.tipo === 'escuela' ? 'Escuela' : 'Privado'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getEstadoColor(
                    caballo.estado
                  )}`}
                >
                  {caballo.estado}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Límite diario:</span>
                  <span className="font-semibold text-gray-900">
                    {caballo.limite_clases_dia} clases
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Cambiar Estado:</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCambiarEstado(caballo.id, 'activo')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${
                      caballo.estado === 'activo'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    Activo
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(caballo.id, 'descanso')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${
                      caballo.estado === 'descanso'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    Descanso
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(caballo.id, 'lesionado')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${
                      caballo.estado === 'lesionado'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Lesionado
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
