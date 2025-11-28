// src/utils/formatters.js
// Funciones helper para formatear y obtener datos de diferentes estructuras

/**
 * Formatea una fecha al formato local salvadoreño (es-SV)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} - Fecha formateada o "-" si no es válida
 * @example formatearFecha("2024-01-15") => "15/1/2024"
 */
export function formatearFecha(fecha) {
  if (!fecha) return "-";

  try {
    return new Date(fecha).toLocaleDateString('es-SV');
  } catch (e) {
    return "-";
  }
}

/**
 * Obtiene el nombre completo de un usuario desde diferentes posibles campos
 * Útil porque la API puede retornar diferentes estructuras de datos
 * @param {Object} usuario - Objeto usuario
 * @returns {string} - Nombre del usuario o "Usuario" por defecto
 */
export function formatearNombre(usuario) {
  if (!usuario) return "Usuario";
  return usuario.nombre_completo || usuario.nombre || usuario.correo || usuario.email || "Usuario";
}

/**
 * Obtiene el ID de un objeto desde diferentes posibles campos
 * Maneja múltiples estructuras de API (id, cliente_id, ticket_id, _id, etc.)
 * @param {Object} objeto - Objeto del cual obtener el ID
 * @returns {number|string|null} - ID encontrado o null
 */
export function obtenerIdFlexible(objeto) {
  if (!objeto) return null;
  return objeto.id ?? objeto.cliente_id ?? objeto.ticket_id ?? objeto.usuario_id ?? objeto._id ?? null;
}

/**
 * Obtiene el nombre de un cliente desde diferentes posibles campos
 * @param {Object} cliente - Objeto cliente
 * @returns {string} - Nombre del cliente o "-" si no se encuentra
 */
export function obtenerNombreCliente(cliente) {
  if (!cliente) return "-";
  return cliente.nombre || cliente.razon_social || cliente.nombre_completo || "-";
}

/**
 * Obtiene el correo de un cliente desde diferentes posibles campos
 * @param {Object} cliente - Objeto cliente
 * @returns {string} - Correo del cliente o "-" si no se encuentra
 */
export function obtenerCorreoCliente(cliente) {
  if (!cliente) return "-";
  return cliente.correo || cliente.email || "-";
}

/**
 * Retorna la clase CSS de Bootstrap según el estado del ticket
 * Usado para los badges de colores en la UI
 * @param {string} estado - Estado del ticket
 * @returns {string} - Clase CSS de Bootstrap
 */
export function obtenerColorEstado(estado) {
  const colores = {
    "Cerrado": "bg-secondary",      // Gris
    "En Proceso": "bg-warning",     // Amarillo
    "Resuelto": "bg-success",       // Verde
    "Abierto": "bg-info"            // Azul
  };
  return colores[estado] || "bg-secondary";
}

/**
 * Retorna la clase CSS de color de texto según la prioridad
 * @param {string} prioridad - Prioridad del ticket
 * @returns {string} - Clase CSS de Bootstrap para color de texto
 */
export function obtenerColorPrioridad(prioridad) {
  const colores = {
    "Alta": "text-danger",      // Rojo
    "Media": "text-warning",    // Amarillo/Naranja
    "Baja": "text-success"      // Verde
  };
  return colores[prioridad] || "";
}