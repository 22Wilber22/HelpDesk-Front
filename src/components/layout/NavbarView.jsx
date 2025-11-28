// src/components/layout/NavbarView.jsx
import React, { useState } from "react";
import TicketsView from "../tickets/TicketsView";
import ClientesView from "../clientes/ClientesView";
import UsuariosView from "../usuarios/UsuariosView";
import DashboardView from "../dashboard/DashboardView";
import { useAuth } from "../../hooks/useAuth";

function NavbarView({ usuario, onLogout }) {
  const { esAdmin, esSupervisor, esAgente } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Permisos para mostrar tabs
  const puedeVerUsuarios = esAdmin() || esSupervisor();
  const puedeVerClientes = esAdmin() || esSupervisor() || esAgente(); // Usuario no puede ver clientes

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ===== HEADER ===== */}
      <header className="bg-white shadow-sm py-3 mb-4">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <img
                src="/Proyecto-nuevo1.png"
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
                className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
                type="button"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/18765/18765656.png "
                  alt="Dashboard"
                  width="24"
                  height="24"
                  className="me-2"
                />
                Dashboard
              </button>

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

              {puedeVerClientes && (
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
              )}

              {puedeVerUsuarios && (
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
            {activeTab === "dashboard" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <DashboardView />
                </div>
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Listado de tickets</h5>
                  <TicketsView usuario={usuario} esAdmin={esAdmin()} />
                </div>
              </div>
            )}

            {activeTab === "clientes" && puedeVerClientes && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Clientes</h5>
                  <ClientesView />
                </div>
              </div>
            )}

            {activeTab === "usuarios" && puedeVerUsuarios && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <UsuariosView />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default NavbarView;