'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { LogIn, Mail, Lock, Shield } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', formData);
      
      if (!['admin', 'profesor'].includes(data.user.rol)) {
        setError('No tienes permisos para acceder a este panel');
        return;
      }

      setAuth(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="text-center space-y-4 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 border border-white/20 rounded-2xl mb-4 backdrop-blur-sm">
              <Logo className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-medium text-white mb-1">
                Santa Bárbara
              </h1>
              <p className="text-sm font-light text-white/60 uppercase tracking-wider">
                Panel Administrativo
              </p>
            </div>
            <p className="text-white/60 text-sm">
              Inicia sesión con tu cuenta de administrador o profesor
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm relative z-10 backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all backdrop-blur-sm"
                  placeholder="admin@santabarbara.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#0a0a0a] py-3.5 rounded-xl font-semibold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0a0a0a] border-t-transparent"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
