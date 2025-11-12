// src/components/tickets/TicketsView.jsx
// Vista principal para gestión de tickets con filtros y acciones

import { useState, useMemo } from 'react';
import { useTickets } from '../../hooks/useTickets';

export default function TicketsView({ usuario, esAdmin }) {
  // Obtener funciones y datos del hook useTickets
  const {
    tickets,
    loading,
    error,
    crear,
    cambiarEstado,
    asignar,
    cerrar,
    obtenerAgentes,
    obtenerAgentePorId,
    filtrar,
    recargar
  } = useTickets();

  // Estados locales para filtros y formulario
  const [q, setQ] = useState(""); // Búsqueda de texto
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [prioridadFiltro, setPrioridadFiltro] = useState("Todas");
  const [soloMios, setSoloMios] = useState(true); // Mostrar solo mis tickets
  const [form, setForm] = useState({
    titulo: "",
    prioridad: "Media",
    descripcion: "",
  });

  // Determinar permisos del usuario
  const esSupervisor = (usuario?.rol || '').toLowerCase() === 'supervisor';
  const puedeAsignar = esAdmin || esSupervisor;
  const agentes = obtenerAgentes();

  // Helper para obtener ID de ticket (maneja diferentes estructuras)
  const getTicketId = (t) => t?.id ?? t?.ticket_id ?? t?._id ?? null;

  // Formatea fecha a formato local salvadoreño
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    try {
      return new Date(fecha).toLocaleDateString('es-SV');
    } catch (e) {
      return "-";
    }
  };

  // Retorna clase CSS según el estado del ticket
  const obtenerColorEstado = (estado) => {
    const colores = {
      "Cerrado": "bg-secondary",
      "En Proceso": "bg-warning",
      "Resuelto": "bg-success",
      "Abierto": "bg-info"
    };
    return colores[estado] || "bg-secondary";
  };

  // Manejador para crear nuevo ticket
  const handleCrear = async (e) => {
    e.preventDefault();
    
    try {
      await crear(form);
      setForm({ titulo: "", prioridad: "Media", descripcion: "" }); // Limpiar formulario
    } catch (e) {
      alert(e.message || "No se pudo crear el ticket");
    }
  };

  // Manejador para cambiar estado de un ticket
  const handleEstado = async (t, nuevoEstado) => {
    const id = getTicketId(t);
    if (id == null) return;
    
    try {
      await cambiarEstado(id, nuevoEstado);
    } catch (e) {
      alert(e.message || "No se pudo actualizar el ticket");
    }
  };

  // Manejador para asignar ticket a un agente
  const handleAsignar = async (t, agenteId) => {
    const id = getTicketId(t);
    if (id == null) return;
    
    try {
      await asignar(id, agenteId);
    } catch (e) {
      alert(e.message || "No se pudo asignar el ticket");
    }
  };

  // Manejador para cerrar un ticket
  const handleCerrar = async (t) => {
    const id = getTicketId(t);
    if (id == null) return;
    if (!window.confirm("¿Cerrar este ticket?")) return;
    
    try {
      await cerrar(id);
    } catch (e) {
      alert(e.message || "No se pudo cerrar el ticket");
    }
  };

  // Aplicar filtros a la lista de tickets (memoizado para optimización)
  const ticketsFiltrados = useMemo(() => {
    return filtrar({
      query: q,
      estado: estadoFiltro,
      prioridad: prioridadFiltro,
      soloMios,
      usuarioActual: usuario
    });
  }, [tickets, q, estadoFiltro, prioridadFiltro, soloMios, usuario, filtrar]);

  // Estados de carga y error
  if (loading) return <p>Cargando tickets...</p>;
  
  if (error) return (
    <div>
      <p className="text-danger">{error}</p>
      <button className="btn btn-sm btn-primary" onClick={recargar}>
        Reintentar
      </button>
    </div>
  );

  return (
    <>
      {/* ==================== BARRA DE FILTROS ==================== */}
      <div className="row g-2 align-items-center mb-3">
        {/* Búsqueda de texto */}
        <div className="col-lg-4">
          <input
            type="search"
            className="form-control"
            placeholder="Buscar (título, estado, prioridad)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        
        {/* Filtro por estado */}
        <div className="col-md-3">
          <select
            className="form-select"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option>Todos</option>
            <option>Abierto</option>
            <option>En Proceso</option>
            <option>Resuelto</option>
          </select>
        </div>
        
        {/* Filtro por prioridad */}
        <div className="col-md-3">
          <select
            className="form-select"
            value={prioridadFiltro}
            onChange={(e) => setPrioridadFiltro(e.target.value)}
          >
            <option>Todas</option>
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
        </div>
     
    
      </div>

      {/* ==================== FORMULARIO DE CREACIÓN ==================== */}
      <form className="row g-2 mb-3" onSubmit={handleCrear}>
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Título / asunto del ticket *"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={form.prioridad}
            onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
          >
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>
        <div className="col-md-1 d-grid">
          <button className="btn btn-dark" type="submit">
            Crear
          </button>
        </div>
      </form>

      {/* ==================== TABLA DE TICKETS ==================== */}
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Asignado a</th>
              {puedeAsignar && <th>Asignar</th>}
              <th>Fecha</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ticketsFiltrados.map((t, i) => {
              const id = getTicketId(t);
              const estado = t.estado || "Abierto";
              const agenteId = t.agente_id ?? t.asignado_a ?? null;

              // Determinar quién está asignado al ticket
              const asignadoCell = (() => {
                if (agenteId != null) {
                  const ag = obtenerAgentePorId(agenteId);
                  return ag
                    ? `${ag.nombre_completo || ag.nombre} (${ag.correo || ag.email})`
                    : `ID ${agenteId}`;
                }
                return <span className="text-muted">Sin asignar</span>;
              })();

              return (
                <tr key={id ?? i}>
                  {/* Columna #: Mostrar numero_ticket o ID del ticket */}
                  <td>
                    <strong>{t.numero_ticket || `#${id}` || (i + 1)}</strong>
                  </td>
                  
                  {/* Columna Título: Mostrar descripcion del ticket */}
                  {/* El backend no tiene campo "titulo" o "asunto", usa "descripcion" */}
                  <td style={{ maxWidth: '400px' }}>
                    <div className="text-truncate" title={t.descripcion}>
                      {t.descripcion || t.numero_ticket || "-"}
                    </div>
                  </td>
                  
                  <td>
                    <span className={`badge ${obtenerColorEstado(estado)}`}>
                      {estado}
                    </span>
                  </td>
                  <td>{t.prioridad || "-"}</td>
                  <td>{asignadoCell}</td>

                  {/* Dropdown de asignación (solo para admin/supervisor) */}
                  {puedeAsignar && (
                    <td style={{ minWidth: 220 }}>
                      <select
                        className="form-select form-select-sm"
                        value={agenteId ?? ""}
                        onChange={(e) => handleAsignar(t, e.target.value)}
                      >
                        <option value="">— Sin asignar —</option>
                        {agentes.map((a) => {
                          const idA = a.id ?? a.usuario_id ?? a.user_id ?? a._id;
                          return (
                            <option key={idA} value={idA}>
                              {a.nombre_completo || a.nombre} ({a.correo || a.email})
                            </option>
                          );
                        })}
                      </select>
                    </td>
                  )}

                  <td>
                    {formatearFecha(t.fecha || t.created_at || t.fecha_creacion)}
                  </td>

                  {/* Botones de acción */}
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleEstado(t, "En Proceso")}
                        disabled={estado === "Cerrado"}
                      >
                        En Proceso
                      </button>
                      <button
                        className="btn btn-outline-success"
                        onClick={() => handleEstado(t, "Resuelto")}
                        disabled={estado === "Cerrado"}
                      >
                        Resuelto
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleCerrar(t)}
                        disabled={estado === "Cerrado"}
                      >
                        Cerrar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {/* Mensaje si no hay resultados */}
            {!ticketsFiltrados.length && (
              <tr>
                <td colSpan={puedeAsignar ? 8 : 7} className="text-center text-muted">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}