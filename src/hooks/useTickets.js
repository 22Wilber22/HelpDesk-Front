import { useState, useEffect, useRef } from 'react';
import {
  obtenerTickets,
  crearTicket,
  actualizarTicket,
  cerrarTicket,
  obtenerUsuarios
} from '../services/api';
import {
  esEstadoValido,
  esPrioridadValida,
  normalizarEstado,
  normalizarPrioridad,
  validarDatosTicket
} from '../constants';
import { useAuth } from './useAuth';

export function useTickets() {
  const { esUsuario, esAdmin, esSupervisor } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cargaIniciada = useRef(false);

  const cargar = async () => {
    if (cargaIniciada.current) return;

    try {
      cargaIniciada.current = true;
      setLoading(true);

      // Solo Admin y Supervisor pueden ver la lista de usuarios (para asignar)
      const puedeVerUsuarios = esAdmin() || esSupervisor();

      const promises = [obtenerTickets()];
      if (puedeVerUsuarios) {
        promises.push(obtenerUsuarios());
      }

      const results = await Promise.all(promises);
      const ticketsData = results[0];
      const usuariosData = puedeVerUsuarios ? results[1] : [];

      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setError("");
    } catch (e) {
      if (e.message.includes('500')) {
        setError("Error del servidor al cargar tickets.");
      } else {
        setError("Error cargando tickets: " + e.message);
      }
    } finally {
      setLoading(false);
      cargaIniciada.current = false;
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (ticketData) => {
    if (!ticketData.titulo?.trim() && !ticketData.descripcion?.trim()) {
      throw new Error("El título o descripción es obligatorio");
    }

    const payload = {
      prioridad: ticketData.prioridad || "Media",
      descripcion: ticketData.descripcion || ticketData.titulo,
      titulo: ticketData.titulo || ticketData.descripcion,
    };

    // Si viene cliente_id o cliente_correo, incluirlo en el payload
    if (ticketData.cliente_id) {
      payload.cliente_id = ticketData.cliente_id;
    }
    if (ticketData.cliente_correo) {
      payload.cliente_correo = ticketData.cliente_correo;
    }

    // Si viene categoria_id, incluirlo
    if (ticketData.categoria_id) {
      payload.categoria_id = ticketData.categoria_id;
    }

    // Validar datos antes de enviar
    const validacion = validarDatosTicket(payload);
    if (!validacion.valid) {
      throw new Error(validacion.errors.join(', '));
    }

    await crearTicket(payload);
    cargaIniciada.current = false;
    await cargar();
  };

  const actualizar = async (id, data) => {
    const previo = [...tickets];

    setTickets((prev) =>
      prev.map((t) => {
        const tId = t?.id ?? t?.ticket_id ?? t?._id;
        return tId === id ? { ...t, ...data } : t;
      })
    );

    try {
      await actualizarTicket(id, data);
    } catch (e) {
      setTickets(previo);
      throw e;
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    // Validar que el estado sea válido
    const estadoNormalizado = normalizarEstado(nuevoEstado);
    if (!estadoNormalizado) {
      throw new Error(`Estado inválido: ${nuevoEstado}. Use uno de los estados válidos.`);
    }

    // Obtener el ticket actual para enviar todos los datos requeridos
    const ticket = tickets.find(t => {
      const tId = t?.id ?? t?.ticket_id ?? t?._id;
      return tId === id;
    });

    if (!ticket) {
      throw new Error("Ticket no encontrado");
    }

    // Normalizar prioridad
    const prioridadNormalizada = normalizarPrioridad(ticket.prioridad) || "Media";

    // Preparar datos en el formato que espera el backend
    const updateData = {
      estado: estadoNormalizado,
      prioridad: prioridadNormalizada,
      descripcion: ticket.descripcion || ticket.titulo || ""
    };

    // Incluir agente_id y categoria_id si existen
    if (ticket.agente_id) {
      updateData.agente_id = ticket.agente_id;
    }
    if (ticket.categoria_id) {
      updateData.categoria_id = ticket.categoria_id;
    }

    // Validar datos antes de enviar
    const validacion = validarDatosTicket(updateData);
    if (!validacion.valid) {
      throw new Error(validacion.errors.join(', '));
    }

    await actualizar(id, updateData);
  };

  const asignar = async (id, agenteId) => {
    await actualizar(id, { agente_id: Number(agenteId) });
  };

  const obtenerAgentes = () => {
    return usuarios.filter((u) => (u.rol || "").toLowerCase() === "agente");
  };

  const obtenerAgentePorId = (id) => {
    const agentes = obtenerAgentes();
    return agentes.find(
      (a) => String(a.id ?? a.usuario_id ?? a.user_id ?? a._id) === String(id)
    );
  };

  const filtrar = ({ query, estado, prioridad, soloMios, usuarioActual }) => {
    let resultado = [...tickets];

    if (usuarioActual) {
      const rol = (usuarioActual.rol || "").toLowerCase();
      const esAdmin = rol === "admin" || rol === "administrador";
      const esSupervisor = rol === "supervisor";
      const esUsuario = rol === "usuario";
      const usuarioId = usuarioActual.id ?? usuarioActual.usuario_id ?? usuarioActual.user_id ?? usuarioActual._id;
      const correoLogueado = (usuarioActual.correo || usuarioActual.email || "").toLowerCase();

      // Si es usuario regular, solo mostrar sus tickets
      if (esUsuario) {
        console.log('🔍 Filtrando tickets para usuario (FULL):', usuarioActual);
        resultado = resultado.filter((t) => {
          // Obtener todos los posibles IDs del ticket
          const idsTicket = [
            t.cliente_id,
            t.usuario_id,
            t.user_id,
            t.creado_por,
            t.created_by
          ].map(id => id ? String(id) : null).filter(Boolean);

          const correosTicket = [
            t.cliente_correo,
            t.creado_por_correo,
            t.email,
            t.correo
          ].map(c => c ? String(c).toLowerCase() : null).filter(Boolean);

          const uId = String(usuarioId);
          const uCorreo = String(correoLogueado).toLowerCase();

          // Verificar si alguno coincide
          const matchId = idsTicket.includes(uId);
          const matchCorreo = correosTicket.includes(uCorreo);

          if (!matchId && !matchCorreo) {
            console.log('❌ Ticket oculto (DETALLE):', {
              ticket: t,
              idsEncontrados: idsTicket,
              correosEncontrados: correosTicket,
              usuarioBuscado: { id: uId, correo: uCorreo }
            });
          }

          return matchId || matchCorreo;
        });
      }
      // Si es agente y soloMios está activo, mostrar solo tickets asignados
      else if (soloMios && !esAdmin && !esSupervisor) {
        resultado = resultado.filter((t) => {
          const asignadoId = t.agente_id ?? t.asignado_a ?? null;
          const asignadoCorreo = (t.agente || t.asignado_a_correo || "").toLowerCase();

          const agente = obtenerAgentePorId(asignadoId);
          const soyAsignadoPorId = agente?.correo?.toLowerCase() === correoLogueado.toLowerCase();
          const soyAsignadoPorCorreo = asignadoCorreo === correoLogueado.toLowerCase();
          const sinAsignar = asignadoId == null && !asignadoCorreo;

          return soyAsignadoPorId || soyAsignadoPorCorreo || sinAsignar;
        });
      }
    }

    if (estado !== "Todos") {
      resultado = resultado.filter((t) =>
        (t.estado || "Abierto").toLowerCase() === estado.toLowerCase()
      );
    }

    if (prioridad !== "Todas") {
      resultado = resultado.filter((t) =>
        (t.prioridad || "").toLowerCase() === prioridad.toLowerCase()
      );
    }

    if (query) {
      const q = query.toLowerCase();
      resultado = resultado.filter((t) => {
        const titulo = (t.titulo || t.asunto || "").toLowerCase();
        const estado = (t.estado || "").toLowerCase();
        const prioridad = (t.prioridad || "").toLowerCase();

        return (
          titulo.includes(q) ||
          estado.includes(q) ||
          prioridad.includes(q)
        );
      });
    }

    return resultado;
  };

  return {
    tickets,
    usuarios,
    loading,
    error,
    crear,
    actualizar,
    cambiarEstado,
    asignar,
    obtenerAgentes,
    obtenerAgentePorId,
    filtrar,
    recargar: cargar
  };
}