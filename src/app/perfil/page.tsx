'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, LogOut, Lock, Eye, EyeOff } from 'lucide-react';

export default function PerfilPage() {
  const { user, logout } = useAuthStore();
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password_actual: '',
    password_nueva: '',
    password_confirmar: '',
  });
  const [mostrarPasswords, setMostrarPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
      window.location.href = '/login';
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.password_nueva !== passwordData.password_confirmar) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.password_nueva.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCambiandoPassword(true);
    try {
      await api.post('/auth/cambiar-password', {
        password_actual: passwordData.password_actual,
        password_nueva: passwordData.password_nueva,
      });
      alert('Contraseña actualizada exitosamente');
      setMostrarCambioPassword(false);
      setPasswordData({
        password_actual: '',
        password_nueva: '',
        password_confirmar: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setCambiandoPassword(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-medium text-white">Mi Perfil</h1>
          <p className="text-white/60 mt-1">Información de tu cuenta</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="font-serif text-lg font-medium text-white mb-5">Información Personal</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6 text-white/70" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Nombre</p>
                <p className="font-medium text-white mt-0.5">
                  {user?.nombre} {user?.apellido}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-6 h-6 text-white/70" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Email</p>
                <p className="font-medium text-white mt-0.5">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6 text-white/70" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Rol</p>
                <p className="font-medium text-white mt-0.5 capitalize">
                  {user?.rol === 'admin' ? 'Administrador' : 'Profesor'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="font-serif text-lg font-medium text-white mb-5">Seguridad</h2>

          {!mostrarCambioPassword ? (
            <button
              onClick={() => setMostrarCambioPassword(true)}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white mb-4"
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">Cambiar Contraseña</span>
            </button>
          ) : (
            <form onSubmit={handleCambiarPassword} className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={mostrarPasswords.actual ? 'text' : 'password'}
                    required
                    value={passwordData.password_actual}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, password_actual: e.target.value })
                    }
                    className="w-full px-4 py-2.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarPasswords({ ...mostrarPasswords, actual: !mostrarPasswords.actual })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {mostrarPasswords.actual ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPasswords.nueva ? 'text' : 'password'}
                    required
                    value={passwordData.password_nueva}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, password_nueva: e.target.value })
                    }
                    className="w-full px-4 py-2.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarPasswords({ ...mostrarPasswords, nueva: !mostrarPasswords.nueva })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {mostrarPasswords.nueva ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPasswords.confirmar ? 'text' : 'password'}
                    required
                    value={passwordData.password_confirmar}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, password_confirmar: e.target.value })
                    }
                    className="w-full px-4 py-2.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarPasswords({
                        ...mostrarPasswords,
                        confirmar: !mostrarPasswords.confirmar,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {mostrarPasswords.confirmar ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={cambiandoPassword}
                  className="flex-1 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10 disabled:opacity-50"
                >
                  {cambiandoPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarCambioPassword(false);
                    setPasswordData({
                      password_actual: '',
                      password_nueva: '',
                      password_confirmar: '',
                    });
                  }}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}
