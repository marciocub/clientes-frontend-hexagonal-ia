import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import ClienteService, { mensajeDeError } from '../../services/ClienteService';
import '../../styles/ClienteForm.css';

/**
 * Pop-up de alta/edición del cliente (Aggregate Root).
 * El agregado solo tiene datos propios: nombre y CUIT.
 * Las tarjetas y facturas se administran desde el detalle (ClienteDetalle).
 * Errores manejados: 400 (validaciones del backend), 404, 403 (sesión).
 */
function ClienteModalForm({ clienteAEditar, onGuardado, onCerrar }) {
  const editando = !!clienteAEditar;
  const [nombre, setNombre] = useState(editando ? clienteAEditar.nombre || '' : '');
  const [cuit, setCuit] = useState(editando ? clienteAEditar.cuit || '' : '');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const datos = {
      nombre: nombre.trim(),
      cuit: cuit.trim(),
    };
    try {
      if (editando) {
        await ClienteService.actualizar(clienteAEditar.id, datos);
      } else {
        await ClienteService.crear(datos);
      }
      onGuardado();
    } catch (err) {
      // 400: validaciones (CUIT con formato inválido) · 404 · 403/401: sesión
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo={editando ? `✏️ Editar cliente #${clienteAEditar.id}` : '➕ Nuevo cliente'} onCerrar={onCerrar}>
      {error && <div className="alerta alerta-error">{error}</div>}

      <form onSubmit={enviar} className="form-grilla">
        <div className="campo">
          <label htmlFor="cli-nombre">Nombre *</label>
          <input
            id="cli-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Juan Pérez"
            maxLength={100}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="cli-cuit">CUIT *</label>
          <input
            id="cli-cuit"
            type="text"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            placeholder="20-12345678-9"
            maxLength={13}
            pattern="\d{2}-?\d{8}-?\d{1}"
            title="Formato 20-12345678-9 (o 20123456789)"
            required
          />
        </div>

        <div className="form-botones">
          <button type="submit" className="btn btn-primario" disabled={cargando}>
            {cargando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear cliente'}
          </button>
          <button type="button" className="btn btn-secundario" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ClienteModalForm;
