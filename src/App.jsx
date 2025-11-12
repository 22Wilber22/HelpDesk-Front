import { useState, useEffect } from "react";
import NavbarView from "./components/layout/NavbarView.jsx";
import LoginView from "./components/auth/LoginView.jsx";

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) setUsuario(JSON.parse(guardado));
  }, []);

  const handleLogin = (userData) => {
    setUsuario(userData);
    localStorage.setItem("usuario", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  return usuario ? (
    <NavbarView usuario={usuario} onLogout={handleLogout} />
  ) : (
    <LoginView onLogin={handleLogin} />
  );
}

export default App;