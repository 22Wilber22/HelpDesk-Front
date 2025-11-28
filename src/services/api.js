// src/services/api.js - VERSIÓN CON JWT Y INTERCEPTOR
const API_URL = import.meta.env.VITE_API_URL || "/api";

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

// ============ OBTENER TOKEN ============
function getToken() {
  return localStorage.getItem("helpdesk_token");
}

// ============ MANEJO DE LOGOUT AUTOMÁTICO ============
function handleUnauthorized() {
  // Limpiar token y usuario
  localStorage.removeItem("helpdesk_token");
  localStorage.removeItem("helpdesk_user");

  // Redirigir a login si no estamos ya ahí
  if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
    window.location.href = "/";
  }

  // Disparar evento para que AuthContext reaccione
  window.dispatchEvent(new Event("auth:logout"));
}

// ============ FUNCIÓN REQUEST MEJORADA CON INTERCEPTOR ============
async function request(path, { method = "GET", headers = {}, body, requiresAuth = true } = {}) {
  const cacheKey = `${method}:${path}`;

  // Si ya hay una petición en curso para esta ruta, esperamos a que termine
  if (ongoingRequests.has(cacheKey)) {
    console.log(`⏳ Esperando petición en curso: ${path}`);
    return ongoingRequests.get(cacheKey);
  }

  // Crear la promesa de la petición
  const requestPromise = (async () => {
    try {
      // Preparar headers
      const requestHeaders = {
        "Content-Type": "application/json",
        ...headers,
      };

      // Agregar token si requiere autenticación
      if (requiresAuth) {
        const token = getToken();
        if (token) {
          requestHeaders["Authorization"] = `Bearer ${token}`;
        }
      }

      // Log para debugging (solo en desarrollo)
      if (import.meta.env.DEV) {
        console.log(`🌐 ${method} ${API_URL}${path}`, {
          headers: requestHeaders,
          body: body,
        });
      }

      const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

      if (import.meta.env.DEV) {
        console.log(`📥 Respuesta ${res.status} de ${path}`);
      }

      // Manejar 401 (No autorizado - token expirado o inválido)
      if (res.status === 401 && requiresAuth) {
        console.warn("⚠️ Token expirado o inválido, cerrando sesión...");
        handleUnauthorized();
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      const text = await res.text().catch(() => "");

      if (!res.ok) {
        // Intentar parsear el error como JSON
        let errorMessage = res.statusText || "Error de red";
        let errorDetails = null;

        if (text) {
          try {
            const errorJson = JSON.parse(text);
            errorMessage = errorJson.error || errorJson.message || errorJson.msg || errorMessage;
            errorDetails = errorJson;
          } catch {
            // Si no es JSON, usar el texto directamente
            errorMessage = text;
          }
        }

        const error = new Error(`${res.status} ${errorMessage}`.trim());
        error.status = res.status;
        error.details = errorDetails || text;
        throw error;
      }

      if (!text) return {};

      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (error) {
      // Re-lanzar errores para que puedan ser manejados por el componente
      throw error;
    } finally {
      // Limpiar la petición en curso
      ongoingRequests.delete(cacheKey);
    }
  })();

  // Guardar la promesa para que otras peticiones puedan esperarla
  ongoingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/* ===================== AUTENTICACIÓN ===================== */
export async function login(correo, password) {
  try {
    console.log("🔐 Intentando login con:", { correo, password: "***" });

    // Intentar primero con 'correo', si falla probar con 'email'
    let response;
    try {
      response = await request("/auth/login", {
        method: "POST",
        body: { correo, password },
        requiresAuth: false,
      });
    } catch (error) {
      // Si falla con 'correo', intentar con 'email'
      if (error.message.includes("500") || error.message.includes("400")) {
        console.log("🔄 Intentando con formato alternativo (email)...");
        try {
          response = await request("/auth/login", {
            method: "POST",
            body: { email: correo, password },
            requiresAuth: false,
          });
        } catch (error2) {
          console.error("❌ Error en ambos intentos:", error2);
          throw error2;
        }
      } else {
        throw error;
      }
    }

    console.log("✅ Respuesta del servidor:", response);

    // El backend debería devolver { token, user } o similar
    if (response.token && response.user) {
      return {
        token: response.token,
        user: response.user,
      };
    }

    // Si el formato es diferente, adaptarlo
    if (response.access_token || response.accessToken) {
      return {
        token: response.access_token || response.accessToken,
        user: response.user || response.usuario || response,
      };
    }

    // Si la respuesta contiene datos directamente
    if (response.data) {
      const data = response.data;
      return {
        token: data.token || data.access_token || data.accessToken,
        user: data.user || data.usuario || data,
      };
    }

    // Si la respuesta es el usuario directamente con token
    if (response.token) {
      return {
        token: response.token,
        user: response,
      };
    }

    console.error("❌ Formato de respuesta inesperado:", response);
    throw new Error("Formato de respuesta inesperado del servidor");
  } catch (error) {
    console.error("❌ Error en login:", error);

    // Mejorar el mensaje de error
    if (error.message.includes("500")) {
      const errorDetails = error.message.match(/\{.*\}/);
      if (errorDetails) {
        try {
          const errorObj = JSON.parse(errorDetails[0]);
          throw new Error(errorObj.error || errorObj.message || "Error del servidor");
        } catch {
          throw new Error("Error del servidor. Verifica la consola para más detalles.");
        }
      }
      throw new Error("Error del servidor. Por favor, verifica que el backend esté funcionando correctamente.");
    }

    if (error.message.includes("401") || error.message.includes("403")) {
      throw new Error("Credenciales incorrectas. Por favor, verifica tu correo y contraseña.");
    }

    if (error.message.includes("404")) {
      throw new Error("Endpoint de login no encontrado. Verifica la configuración del backend.");
    }

    throw error;
  }
}

export async function verifyToken(token) {
  try {
    const response = await request("/auth/verify", {
      method: "POST",
      body: { token },
      requiresAuth: false,
    });

    return response.valid === true || response.isValid === true || response.success === true;
  } catch (error) {
    console.error("Error verificando token:", error);
    return false;
  }
}

export async function changePassword(oldPassword, newPassword) {
  return request("/auth/change-password", {
    method: "POST",
    body: { oldPassword, newPassword },
  });
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
    body: data,
  });
  cache.usuarios = null;
  return result;
}

export async function actualizarUsuario(id, data) {
  if (id == null) throw new Error("ID de usuario requerido");
  const result = await request(`/usuarios/${id}`, {
    method: "PATCH",
    body: data,
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
    body: data,
  });
  cache.tickets = null;
  return result;
}

export async function actualizarTicket(id, data) {
  if (id == null) throw new Error("ID de ticket requerido");
  const result = await request(`/tickets/${id}`, {
    method: "PATCH",
    body: data,
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
    body: data,
  });
  cache.clientes = null;
  return result;
}

export async function actualizarCliente(id, data) {
  if (id == null) throw new Error("ID de cliente requerido");
  const result = await request(`/clientes/${id}`, {
    method: "PATCH",
    body: data,
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
    body: data,
  });
}

export async function actualizarComentario(id, data) {
  if (id == null) throw new Error("ID de comentario requerido");
  return request(`/comentarios/${id}`, {
    method: "PATCH",
    body: data,
  });
}

/* ===================== DASHBOARD ===================== */
export async function obtenerResumenDashboard() {
  console.log('🌐 Obteniendo resumen de dashboard desde API');
  return request("/dashboard/resumen");
}

export function limpiarCache() {
  cache.usuarios = null;
  cache.tickets = null;
  cache.clientes = null;
  cache.timestamp = {};
  console.log('🧹 Caché limpiado');
}
