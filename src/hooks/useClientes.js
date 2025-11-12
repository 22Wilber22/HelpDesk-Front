// src/hooks/useClientes.js
import { useState, useEffect, useRef } from 'react';
import { 
  obtenerClientes, 
  crearCliente, 
  actualizarCliente, 
  eliminarCliente,
  limpiarCache 
} from '../services/api';

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cargaIniciada = useRef(false);

  const cargar = async (forzarRecarga = false) => {
    if (cargaIniciada.current && !forzarRecarga) return;

    try {
      cargaIniciada.current = true;
      setLoading(true);
      
      if (forzarRecarga) {
        limpiarCache();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const data = await obtenerClientes();
      const clientesActivos = Array.isArray(data) 
        ? data.filter(c => c.activo !== 0 && c.activo !== false)
        : [];
      
      setClientes(clientesActivos);
      setError("");
    } catch (e) {
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
      cargaIniciada.current = false;
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (clienteData) => {
    if (!clienteData.nombre.trim()) {
      throw new Error("El nombre es obligatorio");
    }

    await crearCliente(clienteData);
    await new Promise(resolve => setTimeout(resolve, 300));
    await cargar(true);
  };

  const actualizar = async (id, clienteData) => {
    if (!clienteData.nombre.trim()) {
      throw new Error("El nombre es obligatorio");
    }

    await actualizarCliente(id, clienteData);
    await new Promise(resolve => setTimeout(resolve, 300));
    await cargar(true);
  };

  const eliminar = async (id) => {
    const clientesPrevios = [...clientes];
    
    setClientes((prev) => prev.filter((c) => {
      const cId = c?.id ?? c?.cliente_id ?? c?._id;
      return cId !== id;
    }));

    try {
      await eliminarCliente(id);
      await new Promise(resolve => setTimeout(resolve, 500));
      await cargar(true);
    } catch (e) {
      setClientes(clientesPrevios);
      throw e;
    }
  };

  const buscar = (query, clientesList = clientes) => {
    const q = query.trim().toLowerCase();
    if (!q) return clientesList;

    return clientesList.filter((c) => {
      const nombre = (c.nombre || c.razon_social || c.nombre_completo || "").toLowerCase();
      const correo = (c.correo || c.email || "").toLowerCase();
      const telefono = (c.telefono || "").toLowerCase();
      const empresa = (c.empresa || c.razon_social || "").toLowerCase();
      
      return (
        nombre.includes(q) ||
        correo.includes(q) ||
        telefono.includes(q) ||
        empresa.includes(q)
      );
    });
  };

  return {
    clientes,
    loading,
    error,
    crear,
    actualizar,
    eliminar,
    buscar,
    recargar: cargar
  };
}