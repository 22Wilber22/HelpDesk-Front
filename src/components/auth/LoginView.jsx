import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../hooks/useAuth";

function LoginView({ onLogin }) {
  const { login, cargando, error: authError } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const usuario = await login(correo, password);
      onLogin(usuario);
    } catch (err) {
      console.error("Error en login:", err);
    }
  };

  return (
    <div className="login-blur-container">
      <style>{`
        .login-blur-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #f9faffff 0%, #ffffffff 100%);
          position: relative;
          overflow: hidden;
        }

        .login-blur-container::before {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(39,174,96,0.3) 0%, transparent 70%);
          border-radius: 50%;
          top: -200px;
          right: -200px;
          animation: float1 20s ease-in-out infinite;
        }

        .login-blur-container::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(52,152,219,0.3) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -150px;
          left: -150px;
          animation: float2 15s ease-in-out infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 50px) scale(1.1); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.15); }
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-container {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-img {
          width: 100px;
          height: 100px;
          margin: 0 auto 20px;
          background: white;
          border-radius: 20px;
          padding: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .logo-title {
          font-size: 32px;
          font-weight: 700;
          color: #2C3E50;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .logo-subtitle {
          font-size: 14px;
          color: #7f8c8d;
        }

        .welcome-text {
          text-align: center;
          margin-bottom: 32px;
        }

        .welcome-text h3 {
          font-size: 24px;
          font-weight: 600;
          color: #2C3E50;
          margin-bottom: 8px;
        }

        .welcome-text p {
          color: #7f8c8d;
          font-size: 14px;
        }

        .form-group-blur {
          margin-bottom: 20px;
        }

        .input-wrapper-blur {
          position: relative;
        }

        .input-icon-blur {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          z-index: 2;
        }

        .form-input-blur {
          width: 100%;
          height: 54px;
          padding: 0 16px 0 50px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
        }

        .form-input-blur:focus {
          outline: none;
          border-color: #2b3c8aff;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .form-input-blur.error {
          border-color: #e74c3c;
        }

        .password-toggle-blur {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 20px;
          z-index: 2;
        }

        .error-box {
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        .btn-login-blur {
          width: 100%;
          height: 54px;
          background: linear-gradient(135deg, #0b2bb9ff 0%, #2c0dd7ff 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-login-blur:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .btn-login-blur:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-blur {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .footer-blur {
          text-align: center;
          margin-top: 24px;
          color: #7f8c8d;
          font-size: 13px;
        }

        @media (max-width: 576px) {
          .login-card {
            padding: 32px 24px;
            border-radius: 20px;
          }

          .logo-img {
            width: 80px;
            height: 80px;
          }

          .logo-title {
            font-size: 28px;
          }

          .welcome-text h3 {
            font-size: 20px;
          }

          .form-input-blur,
          .btn-login-blur {
            height: 50px;
          }
        }
      `}</style>

      <div className="login-card">
        <div className="logo-container">
          <img
            src="/src/Proyecto-nuevo1.png"
            alt="CALLTRACK"
            className="logo-img"
          />
          <h1 className="logo-title">CALLTRACK</h1>
          <p className="logo-subtitle">Panel de Atención al Cliente</p>
        </div>

        <div className="welcome-text">
          <h3>Bienvenido</h3>
          <p>Ingresa para acceder a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-blur">
            <div className="input-wrapper-blur">
              <span className="input-icon-blur">📧</span>
              <input
                type="email"
                className={`form-input-blur ${authError ? "error" : ""}`}
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={cargando}
                required
              />
            </div>
          </div>

          <div className="form-group-blur">
            <div className="input-wrapper-blur">
              <span className="input-icon-blur">🔒</span>
              <input
                type={mostrarPassword ? "text" : "password"}
                className={`form-input-blur ${authError ? "error" : ""}`}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cargando}
                required
              />
              <button
                type="button"
                className="password-toggle-blur"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                disabled={cargando}
              >
                {mostrarPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {authError && <div className="error-box">⚠️ {authError}</div>}

          <button type="submit" className="btn-login-blur" disabled={cargando}>
            {cargando && <span className="spinner-blur"></span>}
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="footer-blur">© 2025 HelpDesk / CallTrack</p>
      </div>
    </div>
  );
}

export default LoginView;
