"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LogOut,
  Calendar,
  Users,
  Settings,
  BarChart3,
  Package,
  User,
  FileText,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;
  const isAdmin = user?.rol === "admin";

  const navLinks = [
    { href: "/dashboard", icon: Calendar, label: "Agenda General" },
    ...(isAdmin
      ? [
          { href: "/alumnos", icon: Users, label: "Alumnos" },
          { href: "/caballos", icon: Logo, label: "Caballos" },
          { href: "/profesores", icon: Users, label: "Profesores" },
          { href: "/pagos-profesores", icon: DollarSign, label: "Pagos Profesores" },
          { href: "/planes", icon: Package, label: "Planes" },
          { href: "/comprobantes", icon: FileText, label: "Comprobantes" },
        ]
      : []),
    { href: "/estadisticas", icon: BarChart3, label: "Estadísticas" },
    { href: "/perfil", icon: User, label: "Mi Perfil" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav className="bg-[#111111] border-b border-white/10 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Logo className="w-10 h-10 text-white rounded-xl" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-serif text-lg font-medium text-white">
                    Santa Bárbara
                  </div>
                  <div className="text-xs font-light text-white/50 uppercase tracking-wider">
                    Admin
                  </div>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:inline text-sm text-white/70">
                {user?.nombre} {user?.apellido}
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#111111] border-r border-white/10 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-2 overflow-y-auto h-full">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(link.href)
                    ? "bg-white/10 border border-white/20 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-[#111111] border-r border-white/10 min-h-[calc(100vh-4rem)] backdrop-blur-xl">
          <nav className="p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(link.href)
                      ? "bg-white/10 border border-white/20 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 w-full min-w-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
