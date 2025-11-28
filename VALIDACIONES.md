# Guía de Uso - Validaciones de Datos

## Funciones de Validación Disponibles

### 1. Validar Estado de Ticket
```javascript
import { esEstadoValido, normalizarEstado } from '../constants';

// Validar si un estado es válido
if (esEstadoValido('Abierto')) {
  console.log('Estado válido');
}

// Normalizar estado (corrige mayúsculas/minúsculas)
const estado = normalizarEstado('abierto'); // Retorna 'Abierto'
const estadoInvalido = normalizarEstado('cerrado'); // Retorna null
```

### 2. Validar Prioridad
```javascript
import { esPrioridadValida, normalizarPrioridad } from '../constants';

// Validar prioridad
if (esPrioridadValida('Alta')) {
  console.log('Prioridad válida');
}

// Normalizar prioridad
const prioridad = normalizarPrioridad('alta'); // Retorna 'Alta'
```

### 3. Validar Datos Completos de Ticket
```javascript
import { validarDatosTicket } from '../constants';

const ticketData = {
  estado: 'Abierto',
  prioridad: 'Alta',
  descripcion: 'Problema con el sistema'
};

const validacion = validarDatosTicket(ticketData);
if (validacion.valid) {
  // Enviar al backend
  await actualizarTicket(id, ticketData);
} else {
  // Mostrar errores
  console.error(validacion.errors);
}
```

### 4. Validar Datos de Usuario
```javascript
import { validarDatosUsuario } from '../constants';

const userData = {
  rol: 'Agente',
  estado: 'activo',
  nombre: 'Juan Pérez'
};

const validacion = validarDatosUsuario(userData);
if (!validacion.valid) {
  alert(validacion.errors.join('\\n'));
}
```

## Valores Válidos

### Estados de Ticket
- Abierto
- En Proceso
- En Espera
- Resuelto
- Cancelado

### Prioridades
- Baja
- Media
- Alta

### Roles de Usuario
- Admin
- Supervisor
- Agente
- Usuario

### Estados de Usuario
- activo
- inactivo

## Ejemplo Completo en un Componente

```javascript
import { useState } from 'react';
import { validarDatosTicket, OPCIONES_ESTADO_TICKET } from '../constants';
import Swal from 'sweetalert2';

function FormularioTicket() {
  const [formData, setFormData] = useState({
    estado: 'Abierto',
    prioridad: 'Media',
    descripcion: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar antes de enviar
    const validacion = validarDatosTicket(formData);
    
    if (!validacion.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Datos inválidos',
        text: validacion.errors.join(', ')
      });
      return;
    }
    
    try {
      await actualizarTicket(id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Ticket actualizado',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={formData.estado}
        onChange={(e) => setFormData({...formData, estado: e.target.value})}
      >
        {OPCIONES_ESTADO_TICKET.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      <button type="submit">Guardar</button>
    </form>
  );
}
```

## Beneficios

✅ **Previene errores del backend**: Valida antes de enviar
✅ **Normaliza datos**: Corrige mayúsculas/minúsculas automáticamente
✅ **Mensajes claros**: Indica exactamente qué valores son válidos
✅ **Centralizado**: Todas las validaciones en un solo lugar
✅ **Reutilizable**: Usa las mismas funciones en toda la app
