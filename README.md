# HelpDesk Frontend

Sistema de gestión de tickets de soporte técnico, diseñado para facilitar la administración de incidentes, clientes y usuarios con un sistema robusto de roles y permisos.

## 🚀 Características Principales

### 🎫 Gestión de Tickets
*   **Creación y Edición:** Los usuarios pueden crear tickets con título, descripción, prioridad y categoría.
*   **Ciclo de Vida:** Estados configurables (Abierto, En Proceso, En Espera, Resuelto, Cancelado).
*   **Asignación:** Los Supervisores y Administradores pueden asignar tickets a Agentes específicos.
*   **Filtrado Avanzado:** Búsqueda por texto, estado, prioridad y asignación.

### 👥 Gestión de Clientes
*   **CRUD Completo:** Crear, leer, actualizar y eliminar clientes.
*   **Datos de Contacto:** Gestión de información de contacto y empresa.

### 👤 Gestión de Usuarios
*   **Roles:** Sistema jerárquico de roles (Admin, Supervisor, Agente, Usuario).
*   **Administración:** Gestión de perfiles de acceso al sistema.

### 📊 Dashboard Dinámico
*   **Métricas en Tiempo Real:** Visualización de KPIs importantes.
*   **Gráficos Interactivos:** Distribución por estado y prioridad usando `recharts`.
*   **Vistas Personalizadas:**
    *   **Admin/Supervisor:** Vista global de todo el sistema.
    *   **Agente:** Estadísticas de sus tickets asignados.
    *   **Usuario:** Estadísticas de sus propios tickets.

## 🛡️ Roles y Permisos

| Permiso | Admin | Supervisor | Agente | Usuario |
| :--- | :---: | :---: | :---: | :---: |
| **Tickets** |
| Ver Todos | ✅ | ✅ | ❌ (Solo asignados) | ❌ (Solo propios) |
| Crear | ✅ | ✅ | ✅ | ✅ |
| Editar (Detalles) | ✅ | ✅ | ✅ | ✅ (Solo propios) |
| Cambiar Estado | ✅ | ✅ | ✅ | ❌ |
| Asignar Agente | ✅ | ✅ | ❌ | ❌ |
| Cancelar | ✅ | ✅ | ❌ | ✅ (Solo propios) |
| **Clientes** |
| Ver Lista | ✅ | ✅ | ✅ | ❌ |
| Crear/Editar | ✅ | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ |
| **Usuarios** |
| Ver Lista | ✅ | ✅ | ❌ | ❌ |
| Crear/Editar | ✅ | ❌ | ❌ | ❌ |
| **Dashboard** | Global | Global | Asignados | Propios |

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React 18, Vite
*   **Estilos:** Bootstrap 5, CSS Modules
*   **Gráficos:** Recharts
*   **Alertas:** SweetAlert2
*   **HTTP Client:** Fetch API (con interceptores personalizados)
*   **Ruteo:** React Router DOM

## 📦 Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd HelpDesk-Front
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crear un archivo `.env` en la raíz del proyecto (basado en `.env.example` si existe):
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Construir para producción:**
    ```bash
    npm run build
    ```

## 📂 Estructura del Proyecto

```
src/
├── components/
│   ├── clientes/       # Vistas y lógica de clientes
│   ├── dashboard/      # Dashboard y gráficos
│   ├── layout/         # Navbar y estructura base
│   ├── tickets/        # Gestión de tickets
│   ├── usuarios/       # Gestión de usuarios
│   └── common/         # Componentes reutilizables (Modales, etc.)
├── hooks/              # Custom hooks (useAuth, useTickets, etc.)
├── services/           # Comunicación con API (api.js)
├── constants/          # Constantes globales (roles, estados)
└── App.jsx             # Configuración de rutas
```
