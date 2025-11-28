// src/components/tickets/TicketsView.jsx
// Vista principal para gestión de tickets con filtros y acciones

import { useState, useMemo } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { CATEGORIAS_TICKET } from '../../constants';
import Modal from '../common/Modal';
import Swal from 'sweetalert2';

export default function TicketsView({ usuario, esAdmin }) {
  // Obtener funciones y datos del hook useTickets
  const {
    tickets,
    loading,
    error,
    crear,
    actualizar,
    cambiarEstado,
    asignar,
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
    categoria_id: "",
    descripcion: "",
  });
  const [ticketDetalle, setTicketDetalle] = useState(null);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  // Determinar permisos del usuario
  const rol = (usuario?.rol || '').toLowerCase();
  const esSupervisor = rol === 'supervisor';
  const esAgente = rol === 'agente';
  const esUsuario = rol === 'usuario';
  const puedeAsignar = esAdmin || esSupervisor;
  const puedeCancelar = esAdmin || esSupervisor || esUsuario; // Usuarios también pueden cancelar sus tickets
  const puedeActualizarTodos = esAdmin || esSupervisor || esAgente; // Agente+ puede actualizar todos los tickets
  const agentes = obtenerAgentes();

  // Helper para verificar si un ticket pertenece al usuario actual
  const esMiTicket = (ticket) => {
    if (!esUsuario || !usuario) return true; // Si no es usuario regular, puede ver todos

    const usuarioId = usuario.id ?? usuario.usuario_id ?? usuario.user_id ?? usuario._id;
    const correoLogueado = (usuario.correo || usuario.email || "").toLowerCase();

    const clienteId = ticket.cliente_id ?? ticket.usuario_id ?? ticket.user_id ?? ticket.creado_por;
    const clienteCorreo = (ticket.cliente_correo || ticket.creado_por_correo || "").toLowerCase();

    return (
      (usuarioId && String(clienteId) === String(usuarioId)) ||
      (correoLogueado && clienteCorreo === correoLogueado)
    );
  };

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
      "Abierto": "bg-info",
      "En Proceso": "bg-warning",
      "En Espera": "bg-orange",
      "Resuelto": "bg-success",
      "Cancelado": "bg-secondary"
    };
    return colores[estado] || "bg-secondary";
  };

  // Manejador para crear nuevo ticket
  const handleCrear = async (e) => {
    e.preventDefault();

    try {
      // Si es usuario regular, asegurar que el ticket se asocie a él
      const ticketData = { ...form };
      if (esUsuario && usuario) {
        ticketData.cliente_id = usuario.id ?? usuario.usuario_id ?? usuario.user_id ?? usuario._id;
        ticketData.cliente_correo = usuario.correo || usuario.email;
      }

      await crear(ticketData);
      setForm({ titulo: "", prioridad: "Media", categoria_id: "", descripcion: "" }); // Limpiar formulario

      Swal.fire({
        icon: 'success',
        title: '¡Ticket creado!',
        text: 'El ticket se ha creado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message || "No se pudo crear el ticket"
      });
    }
  };

  // Estado para modal de edición
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [ticketEditar, setTicketEditar] = useState(null);
  const [formEditar, setFormEditar] = useState({
    descripcion: "",
    prioridad: "Media",
    categoria_id: ""
  });

  const abrirModalEditar = (t) => {
    setTicketEditar(t);
    setFormEditar({
      descripcion: t.descripcion || t.titulo || "",
      prioridad: t.prioridad || "Media",
      categoria_id: t.categoria_id || ""
    });
    setShowModalEditar(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    if (!ticketEditar) return;

    try {
      // Solo enviamos los campos permitidos para edición de usuario
      const updateData = {
        descripcion: formEditar.descripcion,
        prioridad: formEditar.prioridad,
        categoria_id: formEditar.categoria_id
      };

      await actualizar(getTicketId(ticketEditar), updateData);

      Swal.fire({
        icon: 'success',
        title: 'Ticket actualizado',
        text: 'Los cambios se han guardado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      setShowModalEditar(false);
      setTicketEditar(null);
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message || "No se pudo actualizar el ticket"
      });
    }
  };

  // Manejador para cambiar estado de un ticket
  const handleEstado = async (t, nuevoEstado) => {
    const id = getTicketId(t);
    if (id == null) return;

    // Usuario solo puede cambiar estado de sus propios tickets
    // Agente+ puede cambiar estado de cualquier ticket
    if (!puedeActualizarTodos && !esMiTicket(t)) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso denegado',
        text: 'No tienes permisos para modificar este ticket'
      });
      return;
    }

    try {
      await cambiarEstado(id, nuevoEstado);
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El ticket ahora está en estado: ${nuevoEstado}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message || "No se pudo actualizar el ticket"
      });
    }
  };

  // Manejador para asignar ticket a un agente
  const handleAsignar = async (t, agenteId) => {
    const id = getTicketId(t);
    if (id == null) return;

    try {
      await asignar(id, agenteId);
      Swal.fire({
        icon: 'success',
        title: 'Ticket asignado',
        text: 'El ticket se ha asignado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message || "No se pudo asignar el ticket"
      });
    }
  };

  // Manejador para cancelar un ticket
  const handleCancelar = async (t) => {
    const id = getTicketId(t);
    if (id == null) return;

    // Solo Supervisor, Admin y el propio Usuario pueden cancelar tickets
    if (!puedeCancelar && !esMiTicket(t)) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso denegado',
        text: 'No tienes permisos para cancelar este ticket'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Cancelar este ticket?',
      text: "El ticket será marcado como cancelado",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar ticket',
      cancelButtonText: 'No'
    });

    if (!result.isConfirmed) return;

    try {
      await cambiarEstado(id, 'Cancelado');
      Swal.fire({
        icon: 'success',
        title: 'Ticket cancelado',
        text: 'El ticket se ha cancelado exitosamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message || "No se pudo cancelar el ticket"
      });
    }
  };

  // Aplicar filtros a la lista de tickets (memoizado para optimización)
  // Los usuarios regulares siempre ven solo sus tickets
  const ticketsFiltrados = useMemo(() => {
    return filtrar({
      query: q,
      estado: estadoFiltro,
      prioridad: prioridadFiltro,
      soloMios: (esUsuario || esAgente) ? true : soloMios, // Usuarios y Agentes siempre ven solo sus tickets
      usuarioActual: usuario
    });
  }, [tickets, q, estadoFiltro, prioridadFiltro, soloMios, usuario, filtrar, esUsuario, esAgente]);

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
            <option>En Espera</option>
            <option>Resuelto</option>
            <option>Cancelado</option>
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

        {/* Checkbox "Solo míos" - solo para Admin y Supervisor */}
        {!esUsuario && !esAgente && (
          <div className="col-md-2">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={soloMios}
                onChange={(e) => setSoloMios(e.target.checked)}
                id="soloMios"
              />
              <label className="form-check-label" htmlFor="soloMios">
                Solo míos
              </label>
            </div>
          </div>
        )}
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
        <div className="col-md-3">
          <select
            className="form-select"
            value={form.categoria_id}
            onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            required
          >
            <option value="">Categoría *</option>
            {CATEGORIAS_TICKET.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-12">
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
              <th>Categoría</th>
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
                    <button
                      className="btn btn-link text-start p-0 text-decoration-none text-dark"
                      onClick={() => {
                        setTicketDetalle(t);
                        setShowModalDetalle(true);
                      }}
                      style={{ maxWidth: '100%' }}
                      title="Click para ver detalles"
                    >
                      <div className="text-truncate">
                        {t.descripcion || t.titulo || t.numero_ticket || "-"}
                      </div>
                    </button>
                  </td>

                  <td>
                    {CATEGORIAS_TICKET.find(c => c.id == t.categoria_id)?.nombre || "-"}
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
                      {/* Mostrar botones según permisos */}
                      {(puedeActualizarTodos) && (
                        <>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEstado(t, "En Proceso")}
                            disabled={estado === "Cancelado" || estado === "Resuelto"}
                          >
                            En Proceso
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleEstado(t, "Resuelto")}
                            disabled={estado === "Cancelado" || estado === "Resuelto"}
                          >
                            Resuelto
                          </button>
                        </>
                      )}
                      {/* Solo Supervisor y Admin ven botón Cancelar */}
                      {puedeCancelar && (
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleCancelar(t)}
                          disabled={estado === "Cancelado" || estado === "Resuelto"}
                        >
                          Cancelar
                        </button>
                      )}
                      {!puedeActualizarTodos && !esMiTicket(t) && (
                        <span className="text-muted small">Solo lectura</span>
                      )}

                      {/* Botón Editar para usuarios en sus propios tickets */}
                      {esUsuario && esMiTicket(t) && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => abrirModalEditar(t)}
                          disabled={estado === "Cancelado" || estado === "Resuelto"}
                        >
                          Editar
                        </button>
                      )}
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

      {/* Modal de Detalles de Ticket */}
      <Modal
        isOpen={showModalDetalle}
        onClose={() => {
          setShowModalDetalle(false);
          setTicketDetalle(null);
        }}
        title={`Detalles del Ticket ${ticketDetalle?.numero_ticket || `#${getTicketId(ticketDetalle)}` || ""}`}
        size="lg"
      >
        {ticketDetalle && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Número de Ticket</label>
              <p className="mb-0">
                <strong>{ticketDetalle.numero_ticket || `#${getTicketId(ticketDetalle)}` || "-"}</strong>
              </p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Estado</label>
              <p className="mb-0">
                <span className={`badge ${obtenerColorEstado(ticketDetalle.estado || "Abierto")}`}>
                  {ticketDetalle.estado || "Abierto"}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Prioridad</label>
              <p className="mb-0">
                <span className={`badge ${(ticketDetalle.prioridad || "").toLowerCase() === "alta" ? "bg-danger" :
                  (ticketDetalle.prioridad || "").toLowerCase() === "media" ? "bg-warning" :
                    "bg-info"
                  }`}>
                  {ticketDetalle.prioridad || "-"}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Fecha de Creación</label>
              <p className="mb-0">{formatearFecha(ticketDetalle.fecha || ticketDetalle.created_at || ticketDetalle.fecha_creacion)}</p>
            </div>
            <div className="col-12">
              <label className="form-label fw-bold text-muted">Título / Asunto</label>
              <p className="mb-0">{ticketDetalle.titulo || ticketDetalle.descripcion || "-"}</p>
            </div>
            <div className="col-12">
              <label className="form-label fw-bold text-muted">Descripción</label>
              <div className="border rounded p-3 bg-light">
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {ticketDetalle.descripcion || ticketDetalle.titulo || "Sin descripción"}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Asignado a</label>
              <p className="mb-0">
                {(() => {
                  const agenteId = ticketDetalle.agente_id ?? ticketDetalle.asignado_a ?? null;
                  if (agenteId != null) {
                    const ag = obtenerAgentePorId(agenteId);
                    return ag
                      ? `${ag.nombre_completo || ag.nombre} (${ag.correo || ag.email})`
                      : `ID ${agenteId}`;
                  }
                  return <span className="text-muted">Sin asignar</span>;
                })()}
              </p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">ID del Ticket</label>
              <p className="mb-0 text-muted small">{getTicketId(ticketDetalle) || "-"}</p>
            </div>
            {ticketDetalle.cliente_id && (
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted">Cliente ID</label>
                <p className="mb-0 text-muted small">{ticketDetalle.cliente_id}</p>
              </div>
            )}
            {ticketDetalle.cliente_correo && (
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted">Cliente</label>
                <p className="mb-0">{ticketDetalle.cliente_correo}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Edición de Ticket */}
      <Modal
        isOpen={showModalEditar}
        onClose={() => {
          setShowModalEditar(false);
          setTicketEditar(null);
        }}
        title="Editar Ticket"
      >
        <form onSubmit={handleEditar}>
          <div className="mb-3">
            <label className="form-label">Prioridad</label>
            <select
              className="form-select"
              value={formEditar.prioridad}
              onChange={(e) => setFormEditar({ ...formEditar, prioridad: e.target.value })}
            >
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={formEditar.categoria_id}
              onChange={(e) => setFormEditar({ ...formEditar, categoria_id: e.target.value })}
              required
            >
              <option value="">Seleccione una categoría</option>
              {CATEGORIAS_TICKET.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows="4"
              value={formEditar.descripcion}
              onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
              required
            ></textarea>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModalEditar(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}