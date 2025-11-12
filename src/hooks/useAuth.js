import { useState, useEffect, useRef } from 'react';
import { obtenerUsuarios } from '../services/api';

export function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuariosApi, setUsuariosApi] = useState([]);
  const cargaIniciada = useRef(false);

  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) {
      try {
        setUsuario(JSON.parse(guardado));
      } catch (e) {
        console.error("Error cargando usuario:", e);
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  useEffect(() => {
    if (cargaIniciada.current) return;
    cargaIniciada.current = true;

    const cargarUsuarios = async () => {
      try {
        const data = await obtenerUsuarios();
        setUsuariosApi(data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
      }
    };

    cargarUsuarios();
  }, []);

  const login = async (correo, password) => {
    setError("");
    setCargando(true);

    try {
      if (!usuariosApi || usuariosApi.length === 0) {
        throw new Error("No hay usuarios disponibles");
      }

      const usuarioEncontrado = usuariosApi.find((u) => {
        const mailApi = u.correo || u.email || u.user || u.usuario;
        const passApi = u.password || u.clave || u.contrasena || u.contraseña;

        if (!passApi) return mailApi === correo;
        return mailApi === correo && passApi === password;
      });

      if (!usuarioEncontrado) {
        throw new Error("Credenciales incorrectas");
      }

      setUsuario(usuarioEncontrado);
      localStorage.setItem("usuario", JSON.stringify(usuarioEncontrado));
      setError("");

      return usuarioEncontrado;
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor");
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  const estaAutenticado = () => {
    return usuario !== null;
  };

  const esAdmin = () => {
    return (usuario?.rol || "").toLowerCase() === "admin";
  };

  const esSupervisor = () => {
    return (usuario?.rol || "").toLowerCase() === "supervisor";
  };

  const esAgente = () => {
    return (usuario?.rol || "").toLowerCase() === "agente";
  };

  const puedeAsignarTickets = () => {
    return esAdmin() || esSupervisor();
  };

  const obtenerNombreUsuario = () => {
    return usuario?.nombre_completo || usuario?.nombre || usuario?.correo || usuario?.email || "Usuario";
  };

  return {
    usuario,
    cargando,
    error,
    login,
    logout,
    estaAutenticado,
    esAdmin,
    esSupervisor,
    esAgente,
    puedeAsignarTickets,
    obtenerNombreUsuario
  };
}