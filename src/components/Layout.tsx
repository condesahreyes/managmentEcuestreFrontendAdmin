'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut, Calendar, Users, Settings, BarChart3, Package, User, FileText } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;
  const isAdmin = user?.rol === 'admin';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav className="bg-[#111111] border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Logo className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-serif text-lg font-medium text-white">
                    Santa Bárbara
                  </div>
                  <div className="text-xs font-light text-white/50 uppercase tracking-wider">
                    Admin
                  </div>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/70">
                {user?.nombre} {user?.apellido}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-[#111111] border-r border-white/10 min-h-[calc(100vh-4rem)] backdrop-blur-xl">
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive('/dashboard')
                  ? 'bg-white/10 border border-white/20 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Agenda General</span>
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/alumnos"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/alumnos')
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Alumnos</span>
                </Link>
                <Link
                  href="/caballos"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/caballos')
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Logo className="w-5 h-5" />
                  <span className="font-medium">Caballos</span>
                </Link>
                <Link
                  href="/profesores"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/profesores')
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Profesores</span>
                </Link>
                <Link
                  href="/planes"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/planes')
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Planes</span>
                </Link>
                <Link
                  href="/comprobantes"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/comprobantes')
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Comprobantes</span>
                </Link>
              </>
            )}
            <Link
              href="/estadisticas"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive('/estadisticas')
                  ? 'bg-white/10 border border-white/20 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Estadísticas</span>
            </Link>
            <Link
              href="/perfil"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive('/perfil')
                  ? 'bg-white/10 border border-white/20 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Mi Perfil</span>
            </Link>
          </nav>
        </aside>

        {/* Mobile Menu */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              alert('Menú móvil - Implementar con drawer/sidebar');
            }}
            className="w-14 h-14 rounded-full bg-white text-[#0a0a0a] shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
