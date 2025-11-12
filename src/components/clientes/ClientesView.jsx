// Vista principal para gestión de clientes (CRUD completo)

import { useState, useMemo } from "react";
import { useClientes } from "../../hooks/useClientes";

export default function ClientesView() {
  // Obtener funciones y datos del hook useClientes
  const {
    clientes,
    loading,
    error,
    crear,
    actualizar,
    eliminar,
    buscar,
    recargar,
  } = useClientes();

  // Estados locales para formulario y búsqueda
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    empresa: "",
  });
  const [editId, setEditId] = useState(null); // ID del cliente en edición (null = modo crear)
  const [q, setQ] = useState(""); // Query de búsqueda

  // Helper para obtener ID de cliente (maneja diferentes estructuras)
  const getClienteId = (c) => c?.id ?? c?.cliente_id ?? c?._id ?? null;

  // Obtiene el nombre del cliente desde diferentes posibles campos
  const obtenerNombreCliente = (cliente) => {
    if (!cliente) return "-";
    return (
      cliente.nombre || cliente.razon_social || cliente.nombre_completo || "-"
    );
  };

  // Obtiene el correo del cliente desde diferentes posibles campos
  const obtenerCorreoCliente = (cliente) => {
    if (!cliente) return "-";
    return cliente.correo || cliente.email || "-";
  };

  // Manejador para crear o actualizar cliente
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId != null) {
        // Modo edición: actualizar cliente existente
        await actualizar(editId, form);
      } else {
        // Modo creación: crear nuevo cliente
        await crear(form);
      }

      // Limpiar formulario después de guardar
      setForm({
        nombre: "",
        correo: "",
        telefono: "",
        direccion: "",
        empresa: "",
      });
      setEditId(null);
    } catch (e) {
      alert(e.message || "Error guardando cliente");
    }
  };

  // Manejador para entrar en modo edición
  const handleEdit = (c) => {
    const id = getClienteId(c);
    if (id == null) {
      alert("Este cliente no tiene un ID reconocible.");
      return;
    }

    // Guardar ID del cliente en edición
    setEditId(id);

    // Cargar datos del cliente en el formulario
    setForm({
      nombre: obtenerNombreCliente(c),
      correo: obtenerCorreoCliente(c),
      telefono: c.telefono || "",
      direccion: c.direccion || c.address || "",
      empresa: c.empresa || c.razon_social || "",
    });

    // Scroll suave hacia el formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejador para eliminar cliente
  const handleDelete = async (c) => {
    const id = getClienteId(c);
    if (id == null) {
      alert("Este cliente no tiene un ID reconocible.");
      return;
    }

    const nombreCliente = obtenerNombreCliente(c);
    if (!window.confirm(`¿Eliminar a ${nombreCliente}?`)) return;

    try {
      await eliminar(id);
    } catch (e) {
      alert(e.message || "Error eliminando cliente");
    }
  };

  // Manejador para cancelar edición
  const handleCancelEdit = () => {
    setEditId(null);
    setForm({
      nombre: "",
      correo: "",
      telefono: "",
      direccion: "",
      empresa: "",
    });
  };

  // Aplicar búsqueda a la lista de clientes (memoizado para optimización)
  const clientesFiltrados = useMemo(() => buscar(q), [q, clientes, buscar]);

  // Estados de carga y error
  if (loading) return <p>Cargando clientes...</p>;

  if (error)
    return (
      <div>
        <p className="text-danger">{error}</p>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => recargar(true)}
        >
          Reintentar
        </button>
      </div>
    );

  return (
    <>
      {/* ==================== BARRA DE BÚSQUEDA Y CONTADOR ==================== */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="search"
            className="form-control"
            placeholder="🔍 Buscar por nombre, correo, teléfono o empresa..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-md-6 text-end">
          {/* Contador de resultados */}
          <small className="text-muted">
            {clientesFiltrados.length} de {clientes.length} clientes
          </small>
          {/* Botón de refrescar */}
          <button
            className="btn btn-sm btn-outline-secondary ms-3"
            onClick={() => recargar(true)}
            title="Refrescar lista"
          >
            🔄 Refrescar
          </button>
        </div>
      </div>

      {/* ==================== FORMULARIO DE CREAR/EDITAR ==================== */}
      <form className="card mb-4 shadow-sm" onSubmit={handleSubmit}>
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0">
            {editId != null ? "✏️ Editar Cliente" : "➕ Nuevo Cliente"}
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Campo: Nombre / Razón Social */}
            <div className="col-md-6">
              <label className="form-label">Nombre / Razón Social *</label>
              <input
                className="form-control"
                placeholder="Juan Pérez / Empresa S.A."
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            {/* Campo: Correo Electrónico */}
            <div className="col-md-6">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                placeholder="correo@ejemplo.com"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
            </div>

            {/* Campo: Teléfono */}
            <div className="col-md-4">
              <label className="form-label">Teléfono</label>
              <input
                className="form-control"
                placeholder="2222-2222"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>

            {/* Campo: Empresa */}
            <div className="col-md-4">
              <label className="form-label">Empresa</label>
              <input
                className="form-control"
                placeholder="Nombre de la empresa"
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />
            </div>

            {/* Campo: Dirección */}
            <div className="col-md-4">
              <label className="form-label">Dirección</label>
              <input
                className="form-control"
                placeholder="Calle, Colonia, Ciudad"
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" type="submit">
              {editId != null ? "💾 Actualizar" : "➕ Crear Cliente"}
            </button>
            {editId != null && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleCancelEdit}
              >
                ✖ Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* ==================== MENSAJES DE ESTADO ==================== */}
      {clientesFiltrados.length === 0 && q ? (
        <div className="alert alert-info">
          No se encontraron clientes con "{q}"
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="alert alert-warning">
          No hay clientes registrados. ¡Crea el primero!
        </div>
      ) : (
        /* ==================== TABLA DE CLIENTES ==================== */
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Empresa</th>
                <th>Dirección</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c, i) => {
                const id = getClienteId(c);
                return (
                  <tr key={id ?? i}>
                    <td>{id ?? i + 1}</td>
                    <td>
                      <strong>{obtenerNombreCliente(c)}</strong>
                    </td>
                    <td>{obtenerCorreoCliente(c)}</td>
                    <td>{c.telefono || "-"}</td>
                    <td>{c.empresa || c.razon_social || "-"}</td>
                    <td>
                      <small className="text-muted">
                        {c.direccion || c.address || "-"}
                      </small>
                    </td>
                    <td className="text-end">
                      {/* Botones de acción */}
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(c)}
                          title="Editar cliente"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(c)}
                          title="Eliminar cliente"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
