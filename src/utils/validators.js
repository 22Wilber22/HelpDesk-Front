// Funciones de validación para formularios y datos de entrada

/**
 * Valida formato de email usando expresión regular estándar
 * @param {string} email - Email a validar
 * @returns {boolean} - true si el email es válido
 */
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida formato de teléfono salvadoreño (XXXX-XXXX)
 * Ejemplo válido: 2222-2222, 7777-8888
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} - true si el teléfono cumple el formato
 */
export function validarTelefono(telefono) {
  const regex = /^\d{4}-\d{4}$/;
  return regex.test(telefono);
}

/**
 * Valida todos los campos del formulario de clientes
 * @param {Object} form 
 * @param {string} form.nombre 
 * @param {string} form.correo 
 * @param {string} form.telefono 
 * @returns {Object|null} 
 */
export function validarFormCliente(form) {
  const errores = {};

  // Validar que el nombre no esté vacío
  if (!form.nombre || !form.nombre.trim()) {
    errores.nombre = "El nombre es obligatorio";
  }

  // Si hay correo, validar formato
  if (form.correo && !validarEmail(form.correo)) {
    errores.correo = "Email inválido";
  }

  // Si hay teléfono, validar formato
  if (form.telefono && !validarTelefono(form.telefono)) {
    errores.telefono = "Formato de teléfono: 2222-2222";
  }

  // Retornar null si no hay errores, o el objeto de errores
  return Object.keys(errores).length > 0 ? errores : null;
}

/**
 * Valida todos los campos del formulario de tickets
 * @param {Object} form 
 * @param {string} form.titulo 
 * @param {string} form.prioridad 
 * @returns {Object|null} 
 */
export function validarFormTicket(form) {
  const errores = {};

  // Validar que el título no esté vacío
  if (!form.titulo || !form.titulo.trim()) {
    errores.titulo = "El título es obligatorio";
  }

  // Validar que haya una prioridad seleccionada
  if (!form.prioridad) {
    errores.prioridad = "La prioridad es obligatoria";
  }

  return Object.keys(errores).length > 0 ? errores : null;
}

/**
 * Valida las credenciales de login
 * @param {string} correo 
 * @param {string} password 
 * @returns {Object|null} 
 */
export function validarCredenciales(correo, password) {
  const errores = {};

  // Validar correo
  if (!correo || !correo.trim()) {
    errores.correo = "El correo es obligatorio";
  } else if (!validarEmail(correo)) {
    errores.correo = "Email inválido";
  }

  // Validar contraseña
  if (!password || !password.trim()) {
    errores.password = "La contraseña es obligatoria";
  }

  return Object.keys(errores).length > 0 ? errores : null;
}