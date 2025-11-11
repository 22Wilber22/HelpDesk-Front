import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar() {
     const [activeTab, setActiveTab] = useState('tickets');
  return (
<div className="min-vh-100 d-flex flex-column bg-light">
      
      {/* ==================== HEADER ==================== */}
      {/* Barra superior fija con fondo blanco y sombra sutil */}
      {/* py-3: padding vertical de 3 unidades, mb-4: margen inferior de 4 unidades */}
      <header className="bg-white shadow-sm py-3 mb-4">
        {/* Contenedor adaptable con ancho máximo en pantallas grandes */}
        <div className="container-fluid px-4">
          {/* Flexbox para alinear elementos a los extremos (justify-content-between) */}
          <div className="d-flex justify-content-between align-items-center">
            {/* Grupo: logo circular + título CALLTRACK */}
            <div className="d-flex align-items-center">
              {/* Logo circular con iniciales "CT" */}
              <button type="button" class="btn align-items-center justify-content-center me-3">
              <img 
                  src="src/Proyecto-nuevo1.png"
                  alt="Gestión de Tickets" 
                  width="50" 
                  height="40"
                  href="#"
                  />
              </button>
              {/* Título principal con tamaño de encabezado h4 y sin margen inferior */}
            </div>
            {/* Texto "Usuario Activo" alineado a la derecha, color gris neutro */}
            <span className="text-muted">Usuario Activo</span>
          </div>
        </div>
      </header>

      {/* ==================== CONTENIDO PRINCIPAL ==================== */}
      {/* Sección que crece automáticamente (flex-grow-1) para ocupar todo el espacio restante */}
      {/* Esto hace que el footer (si lo hubiera) quede abajo y el contenido llene la pantalla */}
      <main className="flex-grow-1 d-flex flex-column">
        {/* Contenedor fluido: ocupa todo el ancho disponible sin márgenes fijos */}
        <div className="container-fluid px-4 flex-grow-1 d-flex flex-column">
          
          {/* ==================== TABS (PESTAÑAS) ==================== */}
          {/* Nav tabs de Bootstrap: se adapta al ancho disponible */}
          {/* Las pestañas se apilan verticalmente en móviles pequeños si no caben */}
          <nav className="mb-4">
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              
              {/* Pestaña de Tickets - ACTIVA por defecto */}
              {/* onClick: actualiza el estado activeTab a 'tickets' */}
              {/* className dinámica: 'active' si esta pestaña está seleccionada */}
              <button 
                className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('tickets')}
                type="button" 
                role="tab"
              >
                {/* Imagen del icono con margen derecho (me-2) */}
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/8753/8753206.png" 
                  alt="Gestión de Tickets" 
                  width="24" 
                  height="24"
                  className="me-2"
                />
                {/* Texto de la pestaña */}
                Gestión de Tickets
              </button>

              {/* Pestaña de Clientes */}
              {/* Mismo patrón que el botón anterior, pero para clientes */}
              <button 
                className={`nav-link ${activeTab === 'clientes' ? 'active' : ''}`}
                onClick={() => setActiveTab('clientes')}
                type="button" 
                role="tab"
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/256/1769/1769041.png" 
                  alt="Gestión de Clientes" 
                  width="24" 
                  height="24"
                  className="me-2"
                />
                Gestión de Clientes
              </button>
            </div>
          </nav>
        </div>
      </main>
    </div>
  );
}

export default Navbar