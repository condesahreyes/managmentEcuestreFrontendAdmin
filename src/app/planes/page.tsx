'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Package, Plus, Edit } from 'lucide-react';

interface Plan {
  id: string;
  nombre: string;
  tipo: string;
  clases_mes: number;
  precio: number;
  activo: boolean;
}

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [planEditando, setPlanEditando] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'escuelita',
    clases_mes: 4,
    precio: 0,
  });

  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    try {
      const { data } = await api.get('/admin/planes');
      setPlanes(data || []);
    } catch (error) {
      console.error('Error al cargar planes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (planEditando) {
        await api.patch(`/admin/planes/${planEditando.id}`, formData);
      } else {
        await api.post('/admin/planes', formData);
      }
      setMostrarFormulario(false);
      setPlanEditando(null);
      setFormData({ nombre: '', tipo: 'escuelita', clases_mes: 4, precio: 0 });
      loadPlanes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al guardar plan');
    }
  };

  const handleEditar = (plan: Plan) => {
    setPlanEditando(plan);
    setFormData({
      nombre: plan.nombre,
      tipo: plan.tipo,
      clases_mes: plan.clases_mes,
      precio: plan.precio,
    });
    setMostrarFormulario(true);
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
            <h1 className="text-3xl font-bold text-gray-900">Planes</h1>
            <p className="text-gray-600 mt-1">Gestiona los planes de suscripción</p>
          </div>
          <button
            onClick={() => {
              setPlanEditando(null);
              setFormData({ nombre: '', tipo: 'escuelita', clases_mes: 4, precio: 0 });
              setMostrarFormulario(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Plan</span>
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {planEditando ? 'Editar Plan' : 'Nuevo Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="escuelita">Escuelita</option>
                  <option value="pension_completa">Pensión Completa</option>
                  <option value="media_pension">Media Pensión</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clases por Mes
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.clases_mes}
                    onChange={(e) =>
                      setFormData({ ...formData, clases_mes: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData({ ...formData, precio: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {planEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setPlanEditando(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.nombre}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {plan.tipo.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditar(plan)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clases:</span>
                  <span className="font-semibold text-gray-900">{plan.clases_mes}/mes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-semibold text-gray-900">
                    ${plan.precio.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
