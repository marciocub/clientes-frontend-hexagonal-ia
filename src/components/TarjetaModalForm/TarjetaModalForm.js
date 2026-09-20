import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import ClienteService, { mensajeDeError } from '../../services/ClienteService';
import '../../styles/ClienteForm.css';

/**
 * Pop-up para solicitar una tarjeta de crédito a un cliente.
 * Llama a POST /api/clientes/{id}/tarjetas.
 *
 * La regla de negocio (el límite acumulado de las tarjetas no puede superar
 * el tope de $2.000.000) vive en el dominio (Cliente.solicitarTarjeta):
 * si se excede, el backend responde 409 y el mensaje se muestra aquí.
 */
function TarjetaModalForm({ cliente, onAgregada, onCerrar }) {
  const [marca, setMarca] = useState('VISA');
  const [limiteSolicitado, setLimiteSolicitado] = useState('');
  const [ultimoCuatro, setUltimoCuatro] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const datos = {
      marca: marca.trim(),
      limiteSolicitado: Number(limiteSolicitado),
      ultimoCuatro: ultimoCuatro.trim(),
    };
    try {
      const respuesta = await ClienteService.agregarTarjeta(cliente.id, datos);
      onAgregada(respuesta.data);
    } catch (err) {
      // 409: se supera el tope acumulado · 400: validaciones · 404: cliente inexistente
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo={`💳 Nueva tarjeta · ${cliente.nombre}`} onCerrar={onCerrar}>
      {error && <div className="alerta alerta-error">{error}</div>}

      <form onSubmit={enviar} className="form-grilla">
        <div className="campo">
          <label htmlFor="tar-marca">Marca *</label>
          <input
            id="tar-marca"
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="VISA"
            maxLength={30}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="tar-limite">Límite solicitado *</label>
          <input
            id="tar-limite"
            type="number"
            step="0.01"
            min={0.01}
            value={limiteSolicitado}
            onChange={(e) => setLimiteSolicitado(e.target.value)}
            placeholder="500000"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="tar-ultimos">Últimos 4 dígitos *</label>
          <input
            id="tar-ultimos"
            type="text"
            value={ultimoCuatro}
            onChange={(e) => setUltimoCuatro(e.target.value)}
            placeholder="4321"
            maxLength={4}
            pattern="\d{4}"
            title="Exactamente 4 dígitos numéricos"
            required
          />
        </div>

        <div className="form-botones">
          <button type="submit" className="btn btn-primario" disabled={cargando}>
            {cargando ? 'Solicitando...' : 'Solicitar tarjeta'}
          </button>
          <button type="button" className="btn btn-secundario" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TarjetaModalForm;
