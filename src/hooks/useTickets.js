import { useState, useEffect, useRef } from 'react';
import {
  obtenerTickets,
  crearTicket,
  actualizarTicket,
  cerrarTicket,
  obtenerUsuarios
} from '../services/api';

export function useTickets() {
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

      const [ticketsData, usuariosData] = await Promise.all([
        obtenerTickets(),
        obtenerUsuarios()
      ]);

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
    if (!ticketData.titulo?.trim()) {
      throw new Error("El título es obligatorio");
    }

    const payload = {
      prioridad: ticketData.prioridad,
      descripcion: ticketData.descripcion || ticketData.titulo,
    };

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
    await actualizar(id, { estado: nuevoEstado });
  };

  const asignar = async (id, agenteId) => {
    await actualizar(id, { agente_id: Number(agenteId) });
  };

  const cerrar = async (id) => {
    const previo = [...tickets];

    setTickets((prev) => prev.filter((t) => {
      const tId = t?.id ?? t?.ticket_id ?? t?._id;
      return tId !== id;
    }));

    try {
      await cerrarTicket(id);
    } catch (e) {
      setTickets(previo);
      throw e;
    }
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

    if (soloMios && usuarioActual) {
      const esAdmin = (usuarioActual.rol || "").toLowerCase() === "admin";
      const esSupervisor = (usuarioActual.rol || "").toLowerCase() === "supervisor";

      if (!esAdmin && !esSupervisor) {
        const correoLogueado = usuarioActual.correo || usuarioActual.email || "";

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
    cerrar,
    obtenerAgentes,
    obtenerAgentePorId,
    filtrar,
    recargar: cargar
  };
}