export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  AGENTE: 'agente'
};

export const ESTADOS_TICKET = {
  ABIERTO: 'Abierto',
  EN_PROCESO: 'En Proceso',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado'
};

export const PRIORIDADES = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
};

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

export const MENSAJES_EXITO = {
  CLIENTE_CREADO: "Cliente creado exitosamente",
  CLIENTE_ACTUALIZADO: "Cliente actualizado exitosamente",
  CLIENTE_ELIMINADO: "Cliente eliminado exitosamente",
  TICKET_CREADO: "Ticket creado exitosamente",
  TICKET_ACTUALIZADO: "Ticket actualizado exitosamente",
  TICKET_CERRADO: "Ticket cerrado exitosamente"
};

export const OPCIONES_FILTRO_ESTADO = [
  'Todos',
  'Abierto',
  'En Proceso',
  'Resuelto'
];

export const OPCIONES_FILTRO_PRIORIDAD = [
  'Todas',
  'Alta',
  'Media',
  'Baja'
];