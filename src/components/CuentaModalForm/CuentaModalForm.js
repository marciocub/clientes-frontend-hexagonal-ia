import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import CuentaService, { mensajeDeError } from '../../services/CuentaService';
import '../../styles/ClienteForm.css';

/**
 * Pop-up de alta/edicion de cuentas (dentro del modal generico).
 * Errores manejados: 400 (validaciones / enums invalidos), 409 (numero de cuenta duplicado).
 */
function CuentaModalForm({ cuentaAEditar, onGuardado, onCerrar }) {
  const editando = !!cuentaAEditar;
  const [numeroCuenta, setNumeroCuenta] = useState(editando ? cuentaAEditar.numeroCuenta : '');
  const [clienteId, setClienteId] = useState(editando ? cuentaAEditar.clienteId : '');
  const [saldo, setSaldo] = useState(editando ? cuentaAEditar.saldo : '');
  const [moneda, setMoneda] = useState(editando ? cuentaAEditar.moneda : 'PESOS');
  const [estado, setEstado] = useState(editando ? cuentaAEditar.estado : 'INACTIVO');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const datos = {
      numeroCuenta: numeroCuenta.trim(),
      clienteId: Number(clienteId),
      saldo: Number(saldo),
      moneda,
      estado,
    };
    try {
      if (editando) {
        await CuentaService.actualizar(cuentaAEditar.id, datos);
      } else {
        await CuentaService.crear(datos);
      }
      onGuardado();
    } catch (err) {
      // 400: validaciones · 409: numero duplicado · 403/401: sesión
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo={editando ? `✏️ Editar cuenta #${cuentaAEditar.id}` : '➕ Nueva cuenta'} onCerrar={onCerrar}>
      {error && <div className="alerta alerta-error">{error}</div>}

      <form onSubmit={enviar} className="form-grilla">
        <div className="campo">
          <label htmlFor="ct-numero">Número de cuenta *</label>
          <input
            id="ct-numero"
            type="text"
            value={numeroCuenta}
            onChange={(e) => setNumeroCuenta(e.target.value)}
            placeholder="CTA-0001"
            maxLength={30}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="ct-cliente">Cliente ID *</label>
          <input
            id="ct-cliente"
            type="number"
            min={1}
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            placeholder="1"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="ct-saldo">Saldo *</label>
          <input
            id="ct-saldo"
            type="number"
            step="0.01"
            min={0}
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
            placeholder="1500.50"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="ct-moneda">Moneda *</label>
          <select id="ct-moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
            <option value="PESOS">PESOS</option>
            <option value="DOLAR">DOLAR</option>
            <option value="EURO">EURO</option>
            <option value="REAL">REAL</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="ct-estado">Estado</label>
          <select id="ct-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

        <div className="form-botones">
          <button type="submit" className="btn btn-primario" disabled={cargando}>
            {cargando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear cuenta'}
          </button>
          <button type="button" className="btn btn-secundario" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CuentaModalForm;