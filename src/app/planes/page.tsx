'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Package, Plus, Edit, X } from 'lucide-react';

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
            <h1 className="font-serif text-3xl font-medium text-white">Planes</h1>
            <p className="text-white/60 mt-1">Gestiona los planes de suscripción</p>
          </div>
          <button
            onClick={() => {
              setPlanEditando(null);
              setFormData({ nombre: '', tipo: 'escuelita', clases_mes: 4, precio: 0 });
              setMostrarFormulario(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Plan</span>
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-medium text-white">
                {planEditando ? 'Editar Plan' : 'Nuevo Plan'}
              </h2>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setPlanEditando(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Tipo
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                >
                  <option value="escuelita" className="bg-[#1a1a1a]">Escuelita</option>
                  <option value="pension_completa" className="bg-[#1a1a1a]">Pensión Completa</option>
                  <option value="media_pension" className="bg-[#1a1a1a]">Media Pensión</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
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
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
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
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
                >
                  {planEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setPlanEditando(null);
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
          {planes.map((plan) => (
            <div
              key={plan.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white/80" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{plan.nombre}</h3>
                    <p className="text-sm text-white/50 capitalize">
                      {plan.tipo.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditar(plan)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Clases:</span>
                  <span className="font-medium text-white">{plan.clases_mes}/mes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Precio:</span>
                  <span className="font-medium text-white">
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
