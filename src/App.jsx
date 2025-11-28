// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginView from "./components/auth/LoginView";
import NavbarView from "./components/layout/NavbarView";
import RequireAuth from "./components/RequireAuth";

// Componente interno que usa el contexto
function AppContent() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route 
        path="/" 
        element={
          user ? <Navigate to="/dashboard" replace /> : <LoginView />
        } 
      />

      {/* Rutas protegidas */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <NavbarView usuario={user} onLogout={logout} />
          </RequireAuth>
        }
      />

      {/* Rutas protegidas por roles específicos */}
      <Route
        path="/admin/*"
        element={
          <RequireAuth roles={["admin", "administrador"]}>
            <NavbarView usuario={user} onLogout={logout} />
          </RequireAuth>
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Componente principal que envuelve con AuthProvider
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
