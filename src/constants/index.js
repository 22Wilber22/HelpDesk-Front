// Roles de usuario
export const ROLES = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  AGENTE: 'Agente',
  USUARIO: 'Usuario'
};

// Estados de tickets
export const ESTADOS_TICKET = {
  ABIERTO: 'Abierto',
  EN_PROCESO: 'En Proceso',
  EN_ESPERA: 'En Espera',
  RESUELTO: 'Resuelto',
  CANCELADO: 'Cancelado'
};

// Prioridades
export const PRIORIDADES = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
};

// Categorías de tickets
export const CATEGORIAS_TICKET = [
  { id: 1, nombre: 'Soporte Técnico', descripcion: 'Problemas de hardware o software' },
  { id: 2, nombre: 'Facturación', descripcion: 'Consultas o reclamos de facturación' },
  { id: 3, nombre: 'Reclamos Generales', descripcion: 'Otros reclamos de clientes' }
];

// Estados de usuario
export const ESTADOS_USUARIO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo'
};

// Mensajes de error
export const MENSAJES_ERROR = {
  CARGA_TICKETS: "No se pudieron cargar los tickets",
  CARGA_CLIENTES: "No se pudieron cargar los clientes",
  CARGA_USUARIOS: "No se pudieron cargar los usuarios",
  CREDENCIALES_INVALIDAS: "Credenciales incorrectas",
  SERVIDOR_ERROR: "Error del servidor",
  SIN_USUARIOS: "No hay usuarios disponibles",
  NOMBRE_OBLIGATORIO: "El nombre es obligatorio",
  TITULO_OBLIGATORIO: "El título es obligatorio",
  EMAIL_INVALIDO: "Email inválido",
  TELEFONO_INVALIDO: "Formato de teléfono: 2222-2222"
};

// Mensajes de éxito
export const MENSAJES_EXITO = {
  CLIENTE_CREADO: "Cliente creado exitosamente",
  CLIENTE_ACTUALIZADO: "Cliente actualizado exitosamente",
  CLIENTE_ELIMINADO: "Cliente eliminado exitosamente",
  TICKET_CREADO: "Ticket creado exitosamente",
  TICKET_ACTUALIZADO: "Ticket actualizado exitosamente",
  TICKET_CERRADO: "Ticket cerrado exitosamente"
};

// Opciones para filtros de estado (incluye "Todos" para el filtro)
export const OPCIONES_FILTRO_ESTADO = [
  'Todos',
  'Abierto',
  'En Proceso',
  'En Espera',
  'Resuelto',
  'Cancelado'
];

// Opciones para filtros de prioridad (incluye "Todas" para el filtro)
export const OPCIONES_FILTRO_PRIORIDAD = [
  'Todas',
  'Alta',
  'Media',
  'Baja'
];

// Opciones para formularios - Estados de Ticket
export const OPCIONES_ESTADO_TICKET = [
  { value: 'Abierto', label: 'Abierto' },
  { value: 'En Proceso', label: 'En Proceso' },
  { value: 'En Espera', label: 'En Espera' },
  { value: 'Resuelto', label: 'Resuelto' },
  { value: 'Cancelado', label: 'Cancelado' }
];

// Opciones para formularios - Prioridades
export const OPCIONES_PRIORIDAD = [
  { value: 'Baja', label: 'Baja' },
  { value: 'Media', label: 'Media' },
  { value: 'Alta', label: 'Alta' }
];

// Opciones para formularios - Roles de Usuario
export const OPCIONES_ROL_USUARIO = [
  { value: 'Admin', label: 'Administrador' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Agente', label: 'Agente' },
  { value: 'Usuario', label: 'Usuario' }
];

// Opciones para formularios - Estados de Usuario
export const OPCIONES_ESTADO_USUARIO = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' }
];

// ========== FUNCIONES DE VALIDACIÓN ==========

/**
 * Valida que un estado de ticket sea válido
 * @param {string} estado - Estado a validar
 * @returns {boolean} - true si es válido
 */
export function esEstadoValido(estado) {
  const estadosValidos = Object.values(ESTADOS_TICKET);
  return estadosValidos.includes(estado);
}

/**
 * Valida que una prioridad sea válida
 * @param {string} prioridad - Prioridad a validar
 * @returns {boolean} - true si es válida
 */
export function esPrioridadValida(prioridad) {
  const prioridadesValidas = Object.values(PRIORIDADES);
  return prioridadesValidas.includes(prioridad);
}

/**
 * Valida que un rol sea válido
 * @param {string} rol - Rol a validar
 * @returns {boolean} - true si es válido
 */
export function esRolValido(rol) {
  const rolesValidos = Object.values(ROLES);
  return rolesValidos.includes(rol);
}

/**
 * Valida que un estado de usuario sea válido
 * @param {string} estado - Estado a validar
 * @returns {boolean} - true si es válido
 */
export function esEstadoUsuarioValido(estado) {
  const estadosValidos = Object.values(ESTADOS_USUARIO);
  return estadosValidos.includes(estado);
}

/**
 * Normaliza un estado de ticket (corrige mayúsculas/minúsculas)
 * @param {string} estado - Estado a normalizar
 * @returns {string|null} - Estado normalizado o null si no es válido
 */
export function normalizarEstado(estado) {
  if (!estado) return null;
  const estadoLower = estado.toLowerCase();
  const estadosValidos = Object.values(ESTADOS_TICKET);
  return estadosValidos.find(e => e.toLowerCase() === estadoLower) || null;
}

/**
 * Normaliza una prioridad (corrige mayúsculas/minúsculas)
 * @param {string} prioridad - Prioridad a normalizar
 * @returns {string|null} - Prioridad normalizada o null si no es válida
 */
export function normalizarPrioridad(prioridad) {
  if (!prioridad) return null;
  const prioridadLower = prioridad.toLowerCase();
  const prioridadesValidas = Object.values(PRIORIDADES);
  return prioridadesValidas.find(p => p.toLowerCase() === prioridadLower) || null;
}

/**
 * Obtiene el valor por defecto para un estado de ticket
 * @returns {string} - Estado por defecto
 */
export function getEstadoDefault() {
  return ESTADOS_TICKET.ABIERTO;
}

/**
 * Obtiene el valor por defecto para una prioridad
 * @returns {string} - Prioridad por defecto
 */
export function getPrioridadDefault() {
  return PRIORIDADES.MEDIA;
}

/**
 * Valida datos de ticket antes de enviar al backend
 * @param {Object} ticketData - Datos del ticket
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validarDatosTicket(ticketData) {
  const errors = [];

  if (ticketData.estado && !esEstadoValido(ticketData.estado)) {
    errors.push(`Estado inválido: ${ticketData.estado}. Valores válidos: ${Object.values(ESTADOS_TICKET).join(', ')}`);
  }

  if (ticketData.prioridad && !esPrioridadValida(ticketData.prioridad)) {
    errors.push(`Prioridad inválida: ${ticketData.prioridad}. Valores válidos: ${Object.values(PRIORIDADES).join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida datos de usuario antes de enviar al backend
 * @param {Object} userData - Datos del usuario
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validarDatosUsuario(userData) {
  const errors = [];

  if (userData.rol && !esRolValido(userData.rol)) {
    errors.push(`Rol inválido: ${userData.rol}. Valores válidos: ${Object.values(ROLES).join(', ')}`);
  }

  if (userData.estado && !esEstadoUsuarioValido(userData.estado)) {
    errors.push(`Estado inválido: ${userData.estado}. Valores válidos: ${Object.values(ESTADOS_USUARIO).join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}