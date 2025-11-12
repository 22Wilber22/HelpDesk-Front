// src/services/api.js - VERSIÓN COMPLETA CON CLIENTES CRUD
const API_URL = "/api";

// ============ CACHÉ SIMPLE ============
const cache = {
  usuarios: null,
  tickets: null,
  clientes: null,
  timestamp: {}
};

const CACHE_TIME = 30000; // 30 segundos

function isCacheValid(key) {
  if (!cache[key]) return false;
  const now = Date.now();
  const lastFetch = cache.timestamp[key] || 0;
  return (now - lastFetch) < CACHE_TIME;
}

// ============ CONTROL DE PETICIONES SIMULTÁNEAS ============
const ongoingRequests = new Map();

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const cacheKey = `${method}:${path}`;

  // Si ya hay una petición en curso para esta ruta, esperamos a que termine
  if (ongoingRequests.has(cacheKey)) {
    console.log(`⏳ Esperando petición en curso: ${path}`);
    return ongoingRequests.get(cacheKey);
  }

  // Crear la promesa de la petición
  const requestPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body,
        cache: "no-store",
      });

      const text = await res.text().catch(() => "");

      if (!res.ok) {
        const msg = text || res.statusText || "Error de red";
        throw new Error(`${res.status} ${msg}`.trim());
      }

      if (!text) return {};

      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } finally {
      // Limpiar la petición en curso
      ongoingRequests.delete(cacheKey);
    }
  })();

  // Guardar la promesa para que otras peticiones puedan esperarla
  ongoingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/* ===================== USUARIOS ===================== */
export async function obtenerUsuarios() {
  if (isCacheValid('usuarios')) {
    console.log('📦 Usando usuarios desde caché');
    return cache.usuarios;
  }

  console.log('🌐 Obteniendo usuarios desde API');
  const data = await request("/usuarios");
  cache.usuarios = data;
  cache.timestamp.usuarios = Date.now();
  return data;
}

export async function crearUsuario(data) {
  const result = await request("/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  cache.usuarios = null;
  return result;
}

export async function actualizarUsuario(id, data) {
  if (id == null) throw new Error("ID de usuario requerido");
  const result = await request(`/usuarios/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  cache.usuarios = null;
  return result;
}

export async function desactivarUsuario(id) {
  if (id == null) throw new Error("ID de usuario requerido");
  await request(`/usuarios/${id}`, { method: "DELETE" });
  cache.usuarios = null;
  return true;
}

export async function reactivarUsuario(id) {
  if (id == null) throw new Error("ID de usuario requerido");
  try {
    const result = await actualizarUsuario(id, { activo: true });
    cache.usuarios = null;
    return result;
  } catch {
    try {
      const result = await actualizarUsuario(id, { is_active: true });
      cache.usuarios = null;
      return result;
    } catch {
      const result = await actualizarUsuario(id, { estado: "Activo" });
      cache.usuarios = null;
      return result;
    }
  }
}

/* ===================== TICKETS ===================== */
export async function obtenerTickets() {
  if (isCacheValid('tickets')) {
    console.log('📦 Usando tickets desde caché');
    return cache.tickets;
  }

  console.log('🌐 Obteniendo tickets desde API');
  const data = await request("/tickets");
  cache.tickets = data;
  cache.timestamp.tickets = Date.now();
  return data;
}

export async function crearTicket(data) {
  const result = await request("/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  cache.tickets = null;
  return result;
}

export async function actualizarTicket(id, data) {
  if (id == null) throw new Error("ID de ticket requerido");
  const result = await request(`/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  cache.tickets = null;
  return result;
}

export async function cerrarTicket(id) {
  if (id == null) throw new Error("ID de ticket requerido");
  await request(`/tickets/${id}`, { method: "DELETE" });
  cache.tickets = null;
  return true;
}

/* ===================== CLIENTES ===================== */
export async function obtenerClientes() {
  if (isCacheValid('clientes')) {
    console.log('📦 Usando clientes desde caché');
    return cache.clientes;
  }

  console.log('🌐 Obteniendo clientes desde API');
  const data = await request("/clientes");
  cache.clientes = data;
  cache.timestamp.clientes = Date.now();
  return data;
}

export async function crearCliente(data) {
  const result = await request("/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  cache.clientes = null;
  return result;
}

export async function actualizarCliente(id, data) {
  if (id == null) throw new Error("ID de cliente requerido");
  const result = await request(`/clientes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  cache.clientes = null;
  return result;
}

export async function eliminarCliente(id) {
  if (id == null) throw new Error("ID de cliente requerido");
  await request(`/clientes/${id}`, { method: "DELETE" });
  cache.clientes = null;
  return true;
}

/* ===================== COMENTARIOS ===================== */
export async function obtenerComentariosPorTicket(ticketId) {
  if (ticketId == null) throw new Error("ticket_id requerido");
  return request(`/comentarios/ticket/${ticketId}`);
}

export async function crearComentario(data) {
  return request("/comentarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function actualizarComentario(id, data) {
  if (id == null) throw new Error("ID de comentario requerido");
  return request(`/comentarios/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/* ===================== LIMPIAR CACHÉ ===================== */
export function limpiarCache() {
  cache.usuarios = null;
  cache.tickets = null;
  cache.clientes = null;
  cache.timestamp = {};
  console.log('🧹 Caché limpiado');
}