// src/components/layout/NavbarView.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import TicketsView from "../tickets/TicketsView";
import ClientesView from "../clientes/ClientesView";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  reactivarUsuario,
} from "../../services/api";

function NavbarView({ usuario, onLogout }) {
  const [activeTab, setActiveTab] = useState("tickets");
  const rol = (usuario?.rol || "").toLowerCase();
  const esAdmin = rol === "admin" || rol === "administrador";

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ===== HEADER ===== */}
      <header className="bg-white shadow-sm py-3 mb-4">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <img
                src="src/Proyecto-nuevo1.png"
                alt="CALLTRACK"
                width="50"
                height="40"
                className="me-3"
              />
              {usuario?.rol && <span className="badge bg-secondary">{usuario.rol}</span>}
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">
                {usuario?.nombre_completo || usuario?.correo || "Usuario"}
              </span>
              <button className="btn btn-sm btn-outline-secondary" onClick={onLogout}>
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== CONTENIDO ===== */}
      <main className="flex-grow-1 d-flex flex-column">
        <div className="container-fluid px-4 flex-grow-1 d-flex flex-column">
          {/* Tabs */}
          <nav className="mb-4">
            <div className="nav nav-tabs" role="tablist">
              <button
                className={`nav-link ${activeTab === "tickets" ? "active" : ""}`}
                onClick={() => setActiveTab("tickets")}
                type="button"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/8753/8753206.png"
                  alt="Gestión de Tickets"
                  width="24"
                  height="24"
                  className="me-2"
                />
                Gestión de Tickets
              </button>

              <button
                className={`nav-link ${activeTab === "clientes" ? "active" : ""}`}
                onClick={() => setActiveTab("clientes")}
                type="button"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/456/456283.png"
                  alt="Gestión de Clientes"
                  width="24"
                  height="24"
                  className="me-2"
                />
                Gestión de Clientes
              </button>

              {esAdmin && (
                <button
                  className={`nav-link ${activeTab === "usuarios" ? "active" : ""}`}
                  onClick={() => setActiveTab("usuarios")}
                  type="button"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/456/456212.png"
                    alt="Usuarios"
                    width="24"
                    height="24"
                    className="me-2"
                  />
                  Usuarios
                </button>
              )}
            </div>
          </nav>

          {/* Panels */}
          <div className="flex-grow-1 mb-4">
            {activeTab === "tickets" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Listado de tickets</h5>
                  <TicketsView usuario={usuario} esAdmin={esAdmin} />
                </div>
              </div>
            )}

            {activeTab === "clientes" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Clientes</h5>
                  <ClientesView />
                </div>
              </div>
            )}

            {activeTab === "usuarios" && esAdmin && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Usuarios del sistema</h5>
                  <p className="text-muted">Solo visible para administradores.</p>
                  <UsuariosAdmin />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =======================
   SUBCOMPONENTE: UsuariosAdmin
======================= */
function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre_completo: "",
    correo: "",
    telefono: "",
    rol: "Agente",
    password: "",
  });
  const [editId, setEditId] = useState(null);

  const [q, setQ] = useState("");
  const [rolFiltro, setRolFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Activos");

  const getUserId = (u) => u?.id ?? u?.usuario_id ?? u?.user_id ?? u?._id ?? null;
  const isActivo = (u) => {
    if ("activo" in u) return !!u.activo;
    if ("is_active" in u) return !!u.is_active;
    if ("estado" in u) return String(u.estado).toLowerCase() !== "inactivo";
    return true;
  };

  const cargaIniciada = useRef(false);

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
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
      cargaIniciada.current = false;
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId != null) {
        await actualizarUsuario(editId, form);
      } else {
        await crearUsuario(form);
      }
      setForm({ nombre_completo: "", correo: "", telefono: "", rol: "Agente", password: "" });
      setEditId(null);
      await cargar();
    } catch (e) {
      alert(e.message || "Error guardando usuario");
    }
  };

  const handleEdit = (u) => {
    const id = getUserId(u);
    if (id == null) return alert("Este usuario no tiene un ID reconocible.");
    setEditId(id);
    setForm({
      nombre_completo: u.nombre_completo || "",
      correo: u.correo || u.email || "",
      telefono: u.telefono || "",
      rol: u.rol || "Agente",
      password: "",
    });
  };

  const handleDelete = async (u) => {
    const id = getUserId(u);
    if (id == null) return alert("Este usuario no tiene un ID reconocible.");
    if (!window.confirm("¿Desactivar este usuario?")) return;

    const previo = usuarios;
    setUsuarios((prev) =>
      prev.map((x) =>
        getUserId(x) === id ? { ...x, activo: false, is_active: false, estado: "Inactivo" } : x
      )
    );

    try {
      await desactivarUsuario(id);
      await cargar();
    } catch (e) {
      alert(e.message || "Error desactivando usuario");
      setUsuarios(previo);
    }
  };

  const handleReactivar = async (u) => {
    const id = getUserId(u);
    if (id == null) return alert("Este usuario no tiene un ID reconocible.");
    if (!window.confirm("¿Reactivar este usuario?")) return;

    const previo = usuarios;
    setUsuarios((prev) =>
      prev.map((x) =>
        getUserId(x) === id ? { ...x, activo: true, is_active: true, estado: "Activo" } : x
      )
    );

    try {
      await reactivarUsuario(id);
      await cargar();
    } catch (e) {
      alert(e.message || "Error reactivando usuario");
      setUsuarios(previo);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    const query = q.trim().toLowerCase();

    return usuarios
      .filter((u) => {
        const activo = isActivo(u);
        if (estadoFiltro === "Activos" && !activo) return false;
        if (estadoFiltro === "Inactivos" && activo) return false;
        return true;
      })
      .filter((u) => {
        if (rolFiltro === "Todos") return true;
        return (u.rol || "").toLowerCase() === rolFiltro.toLowerCase();
      })
      .filter((u) => {
        if (!query) return true;
        const nombre = (u.nombre_completo || u.nombre || "").toLowerCase();
        const correo = (u.correo || u.email || "").toLowerCase();
        const tel = (u.telefono || "").toLowerCase();
        return nombre.includes(query) || correo.includes(query) || tel.includes(query);
      });
  }, [usuarios, q, rolFiltro, estadoFiltro]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <>
      <div className="row g-2 align-items-center mb-2">
        <div className="col-md-4">
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={rolFiltro} onChange={(e) => setRolFiltro(e.target.value)}>
            <option>Todos</option>
            <option>Agente</option>
            <option>Supervisor</option>
            <option>Admin</option>

          </select>
        </div>
        <div className="col-md-3">
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
        <div className="col-md-2 text-end">
          <small className="text-muted">
            {usuariosFiltrados.length} de {usuarios.length}
          </small>
        </div>
      </div>

      <form className="row g-2 mb-3" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Nombre completo"
            value={form.nombre_completo}
            onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="email"
            className="form-control"
            placeholder="Correo"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            required
          />
        </div>
        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
          >
            <option>Agente</option>
            <option>Supervisor</option>
            <option>Admin</option>

          </select>
        </div>
        <div className="col-md-2">
          <input
            type="password"
            className="form-control"
            placeholder={editId ? "Nueva contraseña (opcional)" : "Contraseña"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={editId == null}
          />
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-dark" type="submit">
            {editId != null ? "Actualizar" : "Crear"}
          </button>
          {editId != null && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setEditId(null);
                setForm({ nombre_completo: "", correo: "", telefono: "", rol: "Agente", password: "" });
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u, i) => {
              const id = getUserId(u);
              const activo = isActivo(u);
              return (
                <tr key={id ?? i}>
                  <td>{id ?? "-"}</td>
                  <td>{u.nombre_completo || "-"}</td>
                  <td>{u.correo || u.email || "-"}</td>
                  <td>{u.rol || "-"}</td>
                  <td>
                    {activo ? (
                      <span className="badge bg-success">Activo</span>
                    ) : (
                      <span className="badge bg-secondary">Inactivo</span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      {activo ? (
                        <>
                          <button className="btn btn-outline-primary" onClick={() => handleEdit(u)}>
                            Editar
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => handleDelete(u)}>
                            Desactivar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-outline-success" onClick={() => handleReactivar(u)}>
                            ✓ Reactivar
                          </button>
                          <button className="btn btn-outline-primary" onClick={() => handleEdit(u)}>
                            Editar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!usuariosFiltrados.length && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default NavbarView;