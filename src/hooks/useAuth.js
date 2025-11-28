// src/hooks/useAuth.js
import { useAuth as useAuthContext } from "../context/AuthContext";

export function useAuth() {
  const auth = useAuthContext();

  return {
    // Estado
    usuario: auth.user,
    token: auth.token,
    estaAutenticado: auth.isAuthenticated,
    cargando: auth.loading,

    // Acciones
    login: auth.login,
    logout: auth.logout,
    checkToken: auth.checkToken,

    // Roles
    esAdmin: auth.isAdmin,
    esSupervisor: auth.isSupervisor,
    esAgente: auth.isAgente,
    esUsuario: auth.isUsuario,
    hasRole: auth.hasRole,
    puedeAsignarTickets: auth.puedeAsignarTickets,

    // Utilidades
    obtenerNombreUsuario: () => {
      const user = auth.user;
      return user?.nombre_completo || user?.nombre || user?.correo || user?.email || "Usuario";
    },
  };
}
