// src/components/RequireAuth.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function RequireAuth({ children, roles = null }) {
  const { estaAutenticado, cargando, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      navigate("/", { replace: true });
    }
  }, [estaAutenticado, cargando, navigate]);

  // Mostrar loading mientras se verifica la autenticación
  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (el useEffect redirige)
  if (!estaAutenticado) {
    return null;
  }

  // Si se especifican roles, verificar que el usuario tenga uno de ellos
  if (roles && roles.length > 0) {
    if (!hasRole(roles)) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Acceso Denegado</h4>
            <p>No tienes permisos para acceder a esta sección.</p>
            <p className="mb-0">Se requiere uno de los siguientes roles: {roles.join(", ")}</p>
          </div>
        </div>
      );
    }
  }

  // Usuario autenticado y con permisos, renderizar children
  return children;
}

export default RequireAuth;

