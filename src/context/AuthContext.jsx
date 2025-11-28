// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const logout = useCallback(() => {
    // Limpiar token y usuario
    localStorage.removeItem("helpdesk_token");
    localStorage.removeItem("helpdesk_user");

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Verificar token al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem("helpdesk_token");
        const savedUser = localStorage.getItem("helpdesk_user");

        if (savedToken && savedUser) {
          // Verificar si el token sigue siendo válido
          try {
            const userData = JSON.parse(savedUser);
            const { verifyToken: verifyTokenAPI } = await import("../services/api");
            const isValid = await verifyTokenAPI(savedToken);

            if (isValid) {
              setToken(savedToken);
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              // Token inválido, limpiar
              localStorage.removeItem("helpdesk_token");
              localStorage.removeItem("helpdesk_user");
            }
          } catch (error) {
            console.error("Error verificando token:", error);
            localStorage.removeItem("helpdesk_token");
            localStorage.removeItem("helpdesk_user");
          }
        }
      } catch (error) {
        console.error("Error inicializando auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listener para logout automático desde api.js
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("auth:logout", handleLogoutEvent);
    };
  }, [logout]);

  const login = async (token, userData) => {
    try {
      // Guardar token y usuario
      localStorage.setItem("helpdesk_token", token);
      localStorage.setItem("helpdesk_user", JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const checkToken = async () => {
    try {
      const currentToken = localStorage.getItem("helpdesk_token");
      if (!currentToken) return false;

      const { verifyToken: verifyTokenAPI } = await import("../services/api");
      const isValid = await verifyTokenAPI(currentToken);

      if (!isValid) {
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verificando token:", error);
      logout();
      return false;
    }
  };

  // Funciones de roles
  const isAdmin = () => {
    const rol = (user?.rol || "").toLowerCase();
    return rol === "admin" || rol === "administrador";
  };

  const isSupervisor = () => {
    const rol = (user?.rol || "").toLowerCase();
    return rol === "supervisor";
  };

  const isAgente = () => {
    const rol = (user?.rol || "").toLowerCase();
    return rol === "agente";
  };

  const isUsuario = () => {
    const rol = (user?.rol || "").toLowerCase();
    return rol === "usuario";
  };

  const hasRole = (roles) => {
    if (!Array.isArray(roles)) roles = [roles];
    const userRol = (user?.rol || "").toLowerCase();
    return roles.some(rol => rol.toLowerCase() === userRol);
  };

  const puedeAsignarTickets = () => {
    return isAdmin() || isSupervisor();
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    checkToken,
    isAdmin,
    isSupervisor,
    isAgente,
    isUsuario,
    hasRole,
    puedeAsignarTickets,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
