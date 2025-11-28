// src/components/common/Modal.jsx
import { useEffect } from "react";

function Modal({ isOpen, onClose, title, children, size = "lg" }) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1040,
        }}
      />

      {/* Modal */}
      <div
        className="modal fade show"
        style={{
          display: "block",
          zIndex: 1050,
        }}
        tabIndex="-1"
        role="dialog"
        onClick={(e) => {
          // Cerrar si se hace click fuera del contenido
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable" 
          style={{ maxWidth: size === "lg" ? "800px" : size === "md" ? "600px" : "400px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content shadow-lg">
            {/* Header */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">{title}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Cerrar"
              />
            </div>

            {/* Body */}
            <div className="modal-body">{children}</div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;

