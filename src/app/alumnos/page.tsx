"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import {
  Users,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Search,
  Plus,
  X,
  Package,
  Eye,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
  suscripciones: Array<{
    id: string;
    clases_incluidas: number;
    clases_usadas: number;
    fecha_fin: string;
    fecha_inicio: string;
    activa: boolean;
    planes: {
      id: string;
      nombre: string;
    };
  }>;
}

interface Plan {
  id: string;
  nombre: string;
  tipo: string;
  clases_mes: number;
  precio: number;
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState<string>("");
  const [filtroActivo, setFiltroActivo] = useState<string>("activos"); // 'activos', 'inactivos', 'todos'
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarFormularioSuscripcion, setMostrarFormularioSuscripcion] =
    useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(
    null,
  );
  const [alumnoDetalle, setAlumnoDetalle] = useState<Alumno | null>(null);
  const [suscripcionesDetalle, setSuscripcionesDetalle] = useState<any[]>([]);
  const [editandoSuscripcion, setEditandoSuscripcion] = useState<any | null>(
    null,
  );
  const [editSuscripcionData, setEditSuscripcionData] = useState({
    plan_id: "",
    mes: 1,
    año: new Date().getFullYear(),
    clases_incluidas: 0,
    clases_usadas: 0,
    activa: true,
  });
  const [suscripcionData, setSuscripcionData] = useState({
    plan_id: "",
    fecha_inicio: "",
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
  });
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadAlumnos();
    loadPlanes();
  }, [filtroRol, filtroActivo, pagina]);

  useEffect(() => {
    // Resetear a página 1 cuando cambia el filtro o búsqueda
    setPagina(1);
  }, [filtroRol, filtroActivo, searchTerm]);

  const loadAlumnos = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagina,
        limit: 20,
      };

      // Filtro de estado activo
      if (filtroActivo === "activos") {
        params.activo = "true";
      } else if (filtroActivo === "inactivos") {
        params.activo = "false";
      }
      // Si es 'todos', no se envía el parámetro activo

      if (filtroRol) {
        params.rol = filtroRol;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const { data } = await api.get("/admin/alumnos", { params });

      // Si la respuesta incluye paginación
      if (data?.alumnos) {
        setAlumnos(data.alumnos);
        setTotalPaginas(data.paginacion?.totalPaginas || 1);
        setTotal(data.paginacion?.total || 0);
      } else {
        // Fallback para compatibilidad con respuesta antigua
        const alumnosFiltrados = (data || []).filter((alumno: Alumno) => {
          if (!searchTerm) return true;
          const search = searchTerm.toLowerCase();
          return (
            alumno.nombre.toLowerCase().includes(search) ||
            alumno.apellido.toLowerCase().includes(search) ||
            alumno.email.toLowerCase().includes(search)
          );
        });
        setAlumnos(alumnosFiltrados);
        setTotalPaginas(1);
        setTotal(alumnosFiltrados.length);
      }
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanes = async () => {
    try {
      const { data } = await api.get("/admin/planes");
      setPlanes(data || []);
    } catch (error) {
      console.error("Error al cargar planes:", error);
    }
  };

  const handleBloquear = async (id: string, activo: boolean) => {
    try {
      await api.patch(`/admin/alumnos/${id}/bloquear`, { activo: !activo });
      loadAlumnos();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al actualizar estado");
    }
  };

  const handleAsignarSuscripcion = (alumno: Alumno) => {
    setAlumnoSeleccionado(alumno);
    const hoy = new Date();
    setSuscripcionData({
      plan_id: "",
      fecha_inicio: hoy.getMonth() + 1 + "-" + hoy.getFullYear(),
      mes: hoy.getMonth() + 1,
      año: hoy.getFullYear(),
    });
    setMostrarFormularioSuscripcion(true);
  };

  const handleSubmitSuscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumnoSeleccionado) return;
    try {
      await api.post(
        `/admin/alumnos/${alumnoSeleccionado.id}/suscripcion`,
        suscripcionData,
      );
      alert("Suscripción asignada exitosamente");
      setMostrarFormularioSuscripcion(false);
      setAlumnoSeleccionado(null);
      loadAlumnos();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al asignar suscripción");
    }
  };

  const planesFiltrados = planes.filter((plan) => {
    if (!alumnoSeleccionado) return false;
    return plan.tipo === alumnoSeleccionado.rol;
  });

  const handleVerDetalle = async (alumno: Alumno) => {
    setAlumnoDetalle(alumno);
    setEditandoSuscripcion(null);
    try {
      const { data } = await api.get(
        `/admin/alumnos/${alumno.id}/suscripciones`,
      );
      setSuscripcionesDetalle(data || []);
    } catch (error) {
      console.error("Error al cargar suscripciones:", error);
      setSuscripcionesDetalle(alumno.suscripciones || []);
    }
  };

  const handleEditarSuscripcion = (suscripcion: any) => {
    const fechaInicio = parseISO(suscripcion.fecha_inicio);
    setEditSuscripcionData({
      plan_id: suscripcion.plan_id,
      mes: fechaInicio.getMonth() + 1,
      año: fechaInicio.getFullYear(),
      clases_incluidas: suscripcion.clases_incluidas,
      clases_usadas: suscripcion.clases_usadas,
      activa: suscripcion.activa,
    });
    setEditandoSuscripcion(suscripcion);
  };

  const handleGuardarEdicionSuscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoSuscripcion) return;
    try {
      await api.patch(`/admin/suscripciones/${editandoSuscripcion.id}`, {
        plan_id: editSuscripcionData.plan_id,
        mes: editSuscripcionData.mes,
        año: editSuscripcionData.año,
        clases_incluidas: editSuscripcionData.clases_incluidas,
        clases_usadas: editSuscripcionData.clases_usadas,
        activa: editSuscripcionData.activa,
      });
      alert("Suscripción actualizada correctamente");
      setEditandoSuscripcion(null);
      if (alumnoDetalle) {
        const { data } = await api.get(
          `/admin/alumnos/${alumnoDetalle.id}/suscripciones`,
        );
        setSuscripcionesDetalle(data || []);
      }
      loadAlumnos();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al actualizar suscripción");
    }
  };

  const handleEliminarSuscripcion = async (suscripcionId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta suscripción?"))
      return;
    try {
      await api.delete(`/admin/suscripciones/${suscripcionId}`);
      alert("Suscripción eliminada correctamente");
      setEditandoSuscripcion(null);
      if (alumnoDetalle) {
        const { data } = await api.get(
          `/admin/alumnos/${alumnoDetalle.id}/suscripciones`,
        );
        setSuscripcionesDetalle(data || []);
      }
      loadAlumnos();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al eliminar suscripción");
    }
  };

  const alumnosFiltrados = alumnos; // Ya filtrado en el backend o en loadAlumnos

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-white">
              Alumnos
            </h1>
            <p className="text-white/60 mt-1">
              Gestiona los alumnos del centro
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
              />
            </div>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm text-gray-900 bg-white"
            >
              <option value="" className="bg-[#1a1a1a]">
                Todos los tipos
              </option>
              <option value="escuelita" className="bg-[#1a1a1a]">
                Escuelita
              </option>
              <option value="pension_completa" className="bg-[#1a1a1a]">
                Pensión Completa
              </option>
              <option value="media_pension" className="bg-[#1a1a1a]">
                Media Pensión
              </option>
            </select>
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm text-gray-900 bg-white"
            >
              <option value="activos" className="bg-[#1a1a1a]">
                Activos
              </option>
              <option value="inactivos" className="bg-[#1a1a1a]">
                Inactivos
              </option>
              <option value="todos" className="bg-[#1a1a1a]">
                Todos
              </option>
            </select>
          </div>
        </div>

        {mostrarFormularioSuscripcion && alumnoSeleccionado && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-xl font-medium text-white">
                  Asignar Suscripción
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
                </p>
              </div>
              <button
                onClick={() => {
                  setMostrarFormularioSuscripcion(false);
                  setAlumnoSeleccionado(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            <form onSubmit={handleSubmitSuscripcion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Plan
                </label>
                <select
                  required
                  value={suscripcionData.plan_id}
                  onChange={(e) =>
                    setSuscripcionData({
                      ...suscripcionData,
                      plan_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm"
                >
                  <option value="" className="bg-[#1a1a1a]">
                    Selecciona un plan
                  </option>
                  {planesFiltrados.map((plan) => (
                    <option
                      key={plan.id}
                      value={plan.id}
                      className="bg-[#1a1a1a]"
                    >
                      {plan.nombre} - {plan.clases_mes} clases/mes - $
                      {plan.precio.toFixed(2)}
                    </option>
                  ))}
                </select>
                {planesFiltrados.length === 0 && (
                  <p className="text-xs text-white/50 mt-1">
                    No hay planes disponibles para este tipo de alumno. Crea un
                    plan primero.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Mes
                  </label>
                  <select
                    required
                    value={suscripcionData.mes}
                    onChange={(e) =>
                      setSuscripcionData({
                        ...suscripcionData,
                        mes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm text-gray-900 bg-white"
                  >
                    <option value="1" className="bg-[#1a1a1a]">
                      Enero
                    </option>
                    <option value="2" className="bg-[#1a1a1a]">
                      Febrero
                    </option>
                    <option value="3" className="bg-[#1a1a1a]">
                      Marzo
                    </option>
                    <option value="4" className="bg-[#1a1a1a]">
                      Abril
                    </option>
                    <option value="5" className="bg-[#1a1a1a]">
                      Mayo
                    </option>
                    <option value="6" className="bg-[#1a1a1a]">
                      Junio
                    </option>
                    <option value="7" className="bg-[#1a1a1a]">
                      Julio
                    </option>
                    <option value="8" className="bg-[#1a1a1a]">
                      Agosto
                    </option>
                    <option value="9" className="bg-[#1a1a1a]">
                      Septiembre
                    </option>
                    <option value="10" className="bg-[#1a1a1a]">
                      Octubre
                    </option>
                    <option value="11" className="bg-[#1a1a1a]">
                      Noviembre
                    </option>
                    <option value="12" className="bg-[#1a1a1a]">
                      Diciembre
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Año
                  </label>
                  <select
                    required
                    value={suscripcionData.año}
                    onChange={(e) =>
                      setSuscripcionData({
                        ...suscripcionData,
                        año: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:bg-white/10 backdrop-blur-sm text-gray-900 bg-white"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const año = new Date().getFullYear() + i;
                      return (
                        <option key={año} value={año} className="bg-[#1a1a1a]">
                          {año}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {alumnoSeleccionado &&
                (alumnoSeleccionado.rol === "pension_completa" ||
                  alumnoSeleccionado.rol === "media_pension") && (
                  <p className="text-xs text-white/50 italic">
                    Esta suscripción no tendrá fecha de finalización
                    (indeterminada)
                  </p>
                )}
              {alumnoSeleccionado && alumnoSeleccionado.rol === "escuelita" && (
                <p className="text-xs text-white/50 italic">
                  La suscripción será válida solo para el mes seleccionado
                </p>
              )}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-[#0a0a0a] rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg shadow-white/10"
                >
                  Asignar Suscripción
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormularioSuscripcion(false);
                    setAlumnoSeleccionado(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {alumnosFiltrados.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-2">
              No se encontraron alumnos
            </p>
            <p className="text-white/40 text-sm">
              {searchTerm || filtroRol
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay alumnos registrados"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {alumnosFiltrados.map((alumno) => {
                const suscripcion =
                  alumno.suscripciones?.find((s) => s.activa) ||
                  alumno.suscripciones?.[0];
                return (
                  <div
                    key={alumno.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white text-lg">
                          {alumno.nombre} {alumno.apellido}
                        </div>
                        <div className="text-sm text-white/60 mt-1">
                          {alumno.email}
                        </div>
                        {alumno.telefono && (
                          <div className="text-sm text-white/60 flex items-center space-x-2 mt-1">
                            <Phone className="w-4 h-4" />
                            <span>{alumno.telefono}</span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                          alumno.activo
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-red-500/20 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {alumno.activo ? "Activo" : "Bloqueado"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 text-white border border-white/20">
                        {alumno.rol.replace("_", " ")}
                      </span>
                      {suscripcion && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/5 text-white/70 border border-white/10">
                          {suscripcion.planes?.nombre}
                        </span>
                      )}
                    </div>
                    {suscripcion && (
                      <div className="text-sm text-white/60">
                        {suscripcion.clases_usadas}/
                        {suscripcion.clases_incluidas} clases usadas
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleVerDetalle(alumno)}
                        className="flex items-center justify-center space-x-1 px-2 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg text-xs transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden xs:inline">Ver</span>
                      </button>
                      <button
                        onClick={() => handleAsignarSuscripcion(alumno)}
                        className="flex items-center justify-center space-x-1 px-2 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg text-xs transition-all"
                      >
                        <Package className="w-4 h-4" />
                        <span className="hidden xs:inline">Susc.</span>
                      </button>
                      <button
                        onClick={() => handleBloquear(alumno.id, alumno.activo)}
                        className={`flex items-center justify-center px-2 py-2 rounded-lg text-xs transition-all ${
                          alumno.activo
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                        }`}
                      >
                        {alumno.activo ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Alumno
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider hidden md:table-cell">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider hidden lg:table-cell">
                        Suscripción
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
                    {alumnosFiltrados.map((alumno) => {
                      const suscripcion =
                        alumno.suscripciones?.find((s) => s.activa) ||
                        alumno.suscripciones?.[0];
                      return (
                        <tr
                          key={alumno.id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-white">
                              {alumno.nombre} {alumno.apellido}
                            </div>
                            <div className="text-sm text-white/50 md:hidden mt-1">
                              {alumno.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-white/60 space-y-1">
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
                            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 text-white border border-white/20">
                              {alumno.rol.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                            {suscripcion ? (
                              <div className="text-sm">
                                <div className="font-medium text-white">
                                  {suscripcion.planes?.nombre}
                                </div>
                                <div className="text-white/50">
                                  {suscripcion.clases_usadas}/
                                  {suscripcion.clases_incluidas} clases
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-white/50">
                                Sin suscripción
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                                alumno.activo
                                  ? "bg-white/10 text-white border border-white/20"
                                  : "bg-red-500/20 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {alumno.activo ? "Activo" : "Bloqueado"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleVerDetalle(alumno)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg text-sm transition-all"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Ver</span>
                              </button>
                              <button
                                onClick={() => handleAsignarSuscripcion(alumno)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg text-sm transition-all"
                                title="Asignar suscripción"
                              >
                                <Package className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                  Suscripción
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  handleBloquear(alumno.id, alumno.activo)
                                }
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                  alumno.activo
                                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                }`}
                              >
                                {alumno.activo ? (
                                  <>
                                    <Ban className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                      Bloquear
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                      Activar
                                    </span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-4">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-white/70 text-sm">
              Página {pagina} de {totalPaginas} ({total} alumnos)
            </span>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

        {alumnoDetalle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl font-medium text-white">
                    {alumnoDetalle.nombre} {alumnoDetalle.apellido}
                  </h2>
                  <p className="text-white/60 mt-1 text-sm">
                    Detalles del Alumno
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAlumnoDetalle(null);
                    setEditandoSuscripcion(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* Información Personal */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5">
                  <h3 className="font-medium text-white mb-3 md:mb-4 flex items-center space-x-2">
                    <Users className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Información Personal</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">
                        Nombre
                      </p>
                      <p className="text-white text-sm md:text-base">
                        {alumnoDetalle.nombre}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">
                        Apellido
                      </p>
                      <p className="text-white text-sm md:text-base">
                        {alumnoDetalle.apellido}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1 flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </p>
                      <p className="text-white text-sm md:text-base break-all">
                        {alumnoDetalle.email}
                      </p>
                    </div>
                    {alumnoDetalle.telefono && (
                      <div>
                        <p className="text-xs font-medium text-white/50 mb-1 flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>Teléfono</span>
                        </p>
                        <p className="text-white text-sm md:text-base">
                          {alumnoDetalle.telefono}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">
                        Tipo
                      </p>
                      <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 text-white border border-white/20">
                        {alumnoDetalle.rol.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-1">
                        Estado
                      </p>
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg ${
                          alumnoDetalle.activo
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-red-500/20 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {alumnoDetalle.activo ? "Activo" : "Bloqueado"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Suscripciones */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5">
                  <h3 className="font-medium text-white mb-3 md:mb-4 flex items-center space-x-2">
                    <Package className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Suscripciones</span>
                  </h3>
                  {suscripcionesDetalle.length > 0 ? (
                    <div className="space-y-3">
                      {suscripcionesDetalle.map((suscripcion) =>
                        editandoSuscripcion?.id === suscripcion.id ? (
                          <form
                            key={suscripcion.id}
                            onSubmit={handleGuardarEdicionSuscripcion}
                            className="bg-white/10 border border-white/20 rounded-lg p-4 space-y-4"
                          >
                            <div>
                              <label className="block text-xs font-medium text-white/70 mb-2">
                                Plan
                              </label>
                              <select
                                value={editSuscripcionData.plan_id}
                                onChange={(e) =>
                                  setEditSuscripcionData({
                                    ...editSuscripcionData,
                                    plan_id: e.target.value,
                                  })
                                }
                                required
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-gray-900 bg-white"
                              >
                                {planes
                                  .filter((p) => p.tipo === alumnoDetalle?.rol)
                                  .map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                      {plan.nombre}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">
                                  Mes
                                </label>
                                <select
                                  value={editSuscripcionData.mes}
                                  onChange={(e) =>
                                    setEditSuscripcionData({
                                      ...editSuscripcionData,
                                      mes: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-900 bg-white"
                                >
                                  {[
                                    "Enero",
                                    "Febrero",
                                    "Marzo",
                                    "Abril",
                                    "Mayo",
                                    "Junio",
                                    "Julio",
                                    "Agosto",
                                    "Septiembre",
                                    "Octubre",
                                    "Noviembre",
                                    "Diciembre",
                                  ].map((m, i) => (
                                    <option key={i} value={i + 1}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">
                                  Año
                                </label>
                                <select
                                  value={editSuscripcionData.año}
                                  onChange={(e) =>
                                    setEditSuscripcionData({
                                      ...editSuscripcionData,
                                      año: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-900 bg-white"
                                >
                                  {[0, 1, 2, 3, 4].map((i) => {
                                    const y = new Date().getFullYear() + i;
                                    return (
                                      <option key={y} value={y}>
                                        {y}
                                      </option>
                                    );
                                  })}
                                  ;
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">
                                  Clases incluidas
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={editSuscripcionData.clases_incluidas}
                                  onChange={(e) =>
                                    setEditSuscripcionData({
                                      ...editSuscripcionData,
                                      clases_incluidas:
                                        parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-900 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">
                                  Clases usadas
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={editSuscripcionData.clases_usadas}
                                  onChange={(e) =>
                                    setEditSuscripcionData({
                                      ...editSuscripcionData,
                                      clases_usadas:
                                        parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-900 bg-white"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 text-sm text-white/80">
                                <input
                                  type="checkbox"
                                  checked={editSuscripcionData.activa}
                                  onChange={(e) =>
                                    setEditSuscripcionData({
                                      ...editSuscripcionData,
                                      activa: e.target.checked,
                                    })
                                  }
                                  className="rounded"
                                />
                                Activa
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="flex-1 px-3 py-2 bg-white text-[#0a0a0a] rounded-lg text-sm font-medium"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditandoSuscripcion(null)}
                                className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div
                            key={suscripcion.id}
                            className={`bg-white/5 border rounded-lg p-3 md:p-4 ${
                              suscripcion.activa
                                ? "border-white/20 bg-white/10"
                                : "border-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-white text-sm md:text-base">
                                  {suscripcion.planes?.nombre || "Sin plan"}
                                </p>
                                {suscripcion.activa && (
                                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                    Activa
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleEditarSuscripcion(suscripcion)
                                  }
                                  className="p-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleEliminarSuscripcion(suscripcion.id)
                                  }
                                  className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                              <div>
                                <p className="text-xs font-medium text-white/50 mb-1">
                                  Clases
                                </p>
                                <p className="text-white">
                                  {suscripcion.clases_usadas}/
                                  {suscripcion.clases_incluidas} usadas
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-white/50 mb-1 flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Período</span>
                                </p>
                                <p className="text-white text-xs">
                                  {format(
                                    parseISO(suscripcion.fecha_inicio),
                                    "dd MMM yyyy",
                                    { locale: es },
                                  )}
                                  {suscripcion.fecha_fin ? (
                                    <>
                                      {" - "}
                                      {format(
                                        parseISO(suscripcion.fecha_fin),
                                        "dd MMM yyyy",
                                        { locale: es },
                                      )}
                                    </>
                                  ) : (
                                    " - Indeterminado"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50 italic">
                      No tiene suscripciones asignadas
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setAlumnoDetalle(null);
                      handleAsignarSuscripcion(alumnoDetalle);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xl transition-all"
                  >
                    <Package className="w-4 h-4" />
                    <span>Asignar Suscripción</span>
                  </button>
                  <button
                    onClick={() => {
                      setAlumnoDetalle(null);
                      handleBloquear(alumnoDetalle.id, alumnoDetalle.activo);
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
                      alumnoDetalle.activo
                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    }`}
                  >
                    {alumnoDetalle.activo ? (
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
                  <button
                    onClick={() => setAlumnoDetalle(null)}
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
