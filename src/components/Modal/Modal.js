import React, { useEffect } from 'react';
import '../../styles/Modal.css';

/**
 * Pop-up (modal) generico reutilizable para altas, ediciones y detalles.
 * - Overlay oscuro; clic fuera o tecla Escape cierran el modal.
 * - El contenido se pasa como children (el formulario o la vista de cada entidad).
 * - ancho="ancho" agranda el pop-up (se usa en el detalle del agregado cliente).
 */
function Modal({ titulo, onCerrar, ancho, children }) {
  useEffect(() => {
    const manejarEscape = (e) => {
      if (e.key === 'Escape') {
        onCerrar();
      }
    };
    document.addEventListener('keydown', manejarEscape);
    // Bloquea el scroll del fondo mientras el modal esta abierto
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', manejarEscape);
      document.body.style.overflow = '';
    };
  }, [onCerrar]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div
        className={`modal-contenido ${ancho === 'ancho' ? 'modal-contenido-ancho' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-cabecera">
          <h2>{titulo}</h2>
          <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}

export default Modal;