// src/components/usuarios/UsuariosView.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  reactivarUsuario,
} from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../common/Modal";
import Swal from 'sweetalert2';

// Roles válidos del sistema
const ROLES_VALIDOS = ["Admin", "Supervisor", "Agente", "Usuario"];

export default function UsuariosView() {
  const { usuario: usuarioActual, esAdmin, esSupervisor, puedeAsignarTickets } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Formulario
  const [form, setForm] = useState({
    nombre_completo: "",
    correo: "",
    telefono: "",
    rol: "Agente",
    password: "",
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  // Filtros
  const [q, setQ] = useState("");
  const [rolFiltro, setRolFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Activos");

  const cargaIniciada = useRef(false);

  // Helpers
  const getUserId = (u) => u?.id ?? u?.usuario_id ?? u?.user_id ?? u?._id ?? null;

  const isActivo = (u) => {
    if ("activo" in u) return !!u.activo;
    if ("is_active" in u) return !!u.is_active;
    if ("estado" in u) return String(u.estado).toLowerCase() !== "inactivo";
    return true;
  };

  // Cargar usuarios
  const cargar = async () => {
    if (cargaIniciada.current) {
      console.log('⏸️ Carga ya en proceso, esperando...');
      return;
    }

    try {
      cargaIniciada.current = true;
      setLoading(true);
      const data = await obtenerUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      console.error('Error cargando usuarios:', e);
      setError(e.message || "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
      cargaIniciada.current = false;
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Verificar permisos
  const puedeVerLista = esAdmin() || esSupervisor();
  const puedeCrear = esAdmin(); // Solo Admin puede crear
  const puedeEditar = esAdmin(); // Solo Admin puede editar
  const puedeEliminar = esAdmin(); // Solo Admin puede eliminar
  const puedeVerDetalles = esAdmin() || esSupervisor(); // Admin, Supervisor y Agente pueden ver detalles

  // Filtrar usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      // Filtro por búsqueda
      if (q) {
        const searchTerm = q.toLowerCase();
        const nombre = (u.nombre_completo || u.nombre || "").toLowerCase();
        const correo = (u.correo || u.email || "").toLowerCase();
        if (!nombre.includes(searchTerm) && !correo.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por rol
      if (rolFiltro !== "Todos") {
        const rolUsuario = (u.rol || "").toLowerCase();
        if (rolUsuario !== rolFiltro.toLowerCase()) {
          return false;
        }
      }

      // Filtro por estado
      if (estadoFiltro === "Activos") {
        if (!isActivo(u)) return false;
      } else if (estadoFiltro === "Inactivos") {
        if (isActivo(u)) return false;
      }

      return true;
    });
  }, [usuarios, q, rolFiltro, estadoFiltro]);

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!puedeCrear && !editId) {
      Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permisos para crear usuarios' });
      return;
    }

    if (!puedeEditar && editId) {
      Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permisos para editar usuarios' });
      return;
    }

    try {
      if (editId != null) {
        // Actualizar usuario (sin password si está vacío)
        const dataActualizar = { ...form };
        if (!dataActualizar.password || dataActualizar.password.trim() === "") {
          delete dataActualizar.password;
        }
        await actualizarUsuario(editId, dataActualizar);
      } else {
        // Crear usuario
        if (!form.password || form.password.trim() === "") {
          Swal.fire({ icon: 'warning', title: 'Falta información', text: 'La contraseña es requerida para crear un nuevo usuario' });
          return;
        }
        await crearUsuario(form);
      }

      // Limpiar formulario
      setForm({ nombre_completo: "", correo: "", telefono: "", rol: "Agente", password: "" });
      setEditId(null);
      setShowForm(false);

      Swal.fire({
        icon: 'success',
        title: editId ? 'Usuario actualizado' : 'Usuario creado',
        text: 'La operación se realizó con éxito',
        timer: 1500,
        showConfirmButton: false
      });

      await cargar();
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message || "Error guardando usuario"
      });
    }
  };

  // Manejar edición
  const handleEdit = (u) => {
    if (!puedeEditar) {
      Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permisos para editar usuarios' });
      return;
    }

    const id = getUserId(u);
    if (id == null) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Este usuario no tiene un ID reconocible.' });
      return;
    }

    setEditId(id);
    setForm({
      nombre_completo: u.nombre_completo || u.nombre || "",
      correo: u.correo || u.email || "",
      telefono: u.telefono || "",
      rol: u.rol || "Agente",
      password: "", // No mostrar password
    });
    setShowForm(true);
  };

  // Manejar eliminación/desactivación
  const handleDelete = async (u) => {
    if (!puedeEliminar) {
      Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permisos para eliminar usuarios' });
      return;
    }

    const id = getUserId(u);
    if (id == null) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Este usuario no tiene un ID reconocible.' });
      return;
    }

    const result = await Swal.fire({
      title: '¿Desactivar usuario?',
      text: "El usuario perderá acceso al sistema",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const previo = usuarios;
    setUsuarios((prev) =>
      prev.map((x) =>
        getUserId(x) === id ? { ...x, activo: false, is_active: false, estado: "Inactivo" } : x
      )
    );

    try {
      await desactivarUsuario(id);
      Swal.fire({
        icon: 'success',
        title: 'Usuario desactivado',
        text: 'El usuario ha sido desactivado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      await cargar();
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message || "Error desactivando usuario"
      });
      setUsuarios(previo);
    }
  };

  // Manejar reactivación
  const handleReactivar = async (u) => {
    if (!puedeEliminar) {
      Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permisos para reactivar usuarios' });
      return;
    }

    const id = getUserId(u);
    if (id == null) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Este usuario no tiene un ID reconocible.' });
      return;
    }

    const result = await Swal.fire({
      title: '¿Reactivar usuario?',
      text: "El usuario recuperará el acceso al sistema",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const previo = usuarios;
    setUsuarios((prev) =>
      prev.map((x) =>
        getUserId(x) === id ? { ...x, activo: true, is_active: true, estado: "Activo" } : x
      )
    );

    try {
      await reactivarUsuario(id);
      Swal.fire({
        icon: 'success',
        title: 'Usuario reactivado',
        text: 'El usuario ha sido reactivado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      await cargar();
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message || "Error reactivando usuario"
      });
      setUsuarios(previo);
    }
  };

  // Si no tiene permisos para ver la lista
  if (!puedeVerLista) {
    return (
      <div className="alert alert-warning" role="alert">
        <h5 className="alert-heading">Acceso Denegado</h5>
        <p>No tienes permisos para ver la lista de usuarios.</p>
        <p className="mb-0">Solo Administradores y Supervisores pueden acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header con botón de crear */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Gestión de Usuarios</h5>
        {puedeCrear && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm({ nombre_completo: "", correo: "", telefono: "", rol: "Agente", password: "" });
              setEditId(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancelar" : "+ Nuevo Usuario"}
          </button>
        )}
      </div>

      {/* Formulario de crear/editar */}
      {showForm && puedeCrear && (
        <div className="card mb-4">
          <div className="card-body">
            <h6 className="card-title">{editId ? "Editar Usuario" : "Nuevo Usuario"}</h6>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre Completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nombre_completo}
                    onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Correo Electrónico *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Rol *</label>
                  <select
                    className="form-select"
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                    required
                  >
                    {ROLES_VALIDOS.map((rol) => (
                      <option key={rol} value={rol}>
                        {rol}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">
                    Solo se pueden seleccionar roles válidos del sistema
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    {editId ? "Nueva Contraseña (dejar vacío para mantener la actual)" : "Contraseña *"}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editId}
                    minLength={6}
                  />
                  {editId && (
                    <small className="form-text text-muted">
                      Solo completa este campo si deseas cambiar la contraseña
                    </small>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-success me-2">
                  {editId ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setForm({ nombre_completo: "", correo: "", telefono: "", rol: "Agente", password: "" });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Buscar</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre o correo..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Filtrar por Rol</label>
              <select
                className="form-select"
                value={rolFiltro}
                onChange={(e) => setRolFiltro(e.target.value)}
              >
                <option>Todos</option>
                {ROLES_VALIDOS.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filtrar por Estado</label>
              <select
                className="form-select"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option>Activos</option>
                <option>Inactivos</option>
                <option>Todos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Tabla de usuarios */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((u) => {
                      const id = getUserId(u);
                      const activo = isActivo(u);
                      const esUsuarioActual = getUserId(u) === getUserId(usuarioActual);

                      return (
                        <tr key={id} className={!activo ? "table-secondary" : ""}>
                          <td>{u.nombre_completo || u.nombre || "-"}</td>
                          <td>{u.correo || u.email || "-"}</td>
                          <td>{u.telefono || "-"}</td>
                          <td>
                            <span className={`badge ${(u.rol || "").toLowerCase() === "admin" ? "bg-danger" :
                              (u.rol || "").toLowerCase() === "supervisor" ? "bg-warning" :
                                (u.rol || "").toLowerCase() === "agente" ? "bg-info" :
                                  "bg-secondary"
                              }`}>
                              {u.rol || "-"}
                            </span>
                          </td>
                          <td>
                            {activo ? (
                              <span className="badge bg-success">Activo</span>
                            ) : (
                              <span className="badge bg-secondary">Inactivo</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              {puedeVerDetalles && (
                                <button
                                  className="btn btn-outline-info"
                                  onClick={() => {
                                    setUsuarioDetalle(u);
                                    setShowModalDetalle(true);
                                  }}
                                  title="Ver detalles"
                                >
                                  👁️
                                </button>
                              )}
                              {puedeEditar && !esUsuarioActual && (
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEdit(u)}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                              )}
                              {puedeEliminar && !esUsuarioActual && (
                                <>
                                  {activo ? (
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleDelete(u)}
                                      title="Desactivar"
                                    >
                                      🗑️
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-outline-success"
                                      onClick={() => handleReactivar(u)}
                                      title="Reactivar"
                                    >
                                      ♻️
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-muted">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Usuario */}
      <Modal
        isOpen={showModalDetalle}
        onClose={() => {
          setShowModalDetalle(false);
          setUsuarioDetalle(null);
        }}
        title="Detalles del Usuario"
      >
        {usuarioDetalle && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Nombre Completo</label>
              <p className="mb-0">{usuarioDetalle.nombre_completo || usuarioDetalle.nombre || "-"}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Correo Electrónico</label>
              <p className="mb-0">{usuarioDetalle.correo || usuarioDetalle.email || "-"}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Teléfono</label>
              <p className="mb-0">{usuarioDetalle.telefono || "-"}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Rol</label>
              <p className="mb-0">
                <span className={`badge ${(usuarioDetalle.rol || "").toLowerCase() === "admin" ? "bg-danger" :
                  (usuarioDetalle.rol || "").toLowerCase() === "supervisor" ? "bg-warning" :
                    (usuarioDetalle.rol || "").toLowerCase() === "agente" ? "bg-info" :
                      "bg-secondary"
                  }`}>
                  {usuarioDetalle.rol || "-"}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">Estado</label>
              <p className="mb-0">
                {isActivo(usuarioDetalle) ? (
                  <span className="badge bg-success">Activo</span>
                ) : (
                  <span className="badge bg-secondary">Inactivo</span>
                )}
              </p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted">ID</label>
              <p className="mb-0 text-muted small">{getUserId(usuarioDetalle) || "-"}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

