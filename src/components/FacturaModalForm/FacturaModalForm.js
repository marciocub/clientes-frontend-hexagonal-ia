import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import ClienteService, { mensajeDeError } from '../../services/ClienteService';
import '../../styles/ClienteForm.css';
import '../../styles/ClienteDetalle.css';

/**
 * Pop-up para emitir una factura con sus items a un cliente.
 * Llama a POST /api/clientes/{id}/facturas.
 *
 * El monto total NO se envía: lo calcula el dominio (Cliente.emitirFactura ->
 * Factura.calcularTotal, que suma ItemFactura.calcularSubtotal). Aquí solo se
 * muestra un total estimado en vivo para comodidad del usuario.
 */

const itemVacio = () => ({ descripcion: '', cantidad: 1, precioUnitario: '' });

function FacturaModalForm({ cliente, onEmitida, onCerrar }) {
  const [numeroFactura, setNumeroFactura] = useState('');
  const [items, setItems] = useState([itemVacio()]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cambiarItem = (indice, campo, valor) => {
    setItems((previos) =>
      previos.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item))
    );
  };

  const agregarItem = () => setItems((previos) => [...previos, itemVacio()]);

  const quitarItem = (indice) => {
    setItems((previos) => (previos.length === 1 ? previos : previos.filter((_, i) => i !== indice)));
  };

  const subtotalDe = (item) => {
    const cantidad = Number(item.cantidad) || 0;
    const precio = Number(item.precioUnitario) || 0;
    return cantidad * precio;
  };

  const totalEstimado = items.reduce((acumulado, item) => acumulado + subtotalDe(item), 0);

  const formatearMonto = (monto) =>
    Number(monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const datos = {
      numeroFactura: numeroFactura.trim(),
      items: items.map((item) => ({
        descripcion: item.descripcion.trim(),
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
      })),
    };
    try {
      const respuesta = await ClienteService.agregarFactura(cliente.id, datos);
      onEmitida(respuesta.data);
    } catch (err) {
      // 400: validaciones (al menos un item, cantidades, precios) · 404: cliente inexistente
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo={`🧾 Nueva factura · ${cliente.nombre}`} onCerrar={onCerrar} ancho="ancho">
      {error && <div className="alerta alerta-error">{error}</div>}

      <form onSubmit={enviar}>
        <div className="form-grilla">
          <div className="campo">
            <label htmlFor="fac-numero">Número de factura *</label>
            <input
              id="fac-numero"
              type="text"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              placeholder="F-0001-00001234"
              maxLength={30}
              required
            />
          </div>
        </div>

        <div className="items-cabecera">
          <h3>Items de la factura</h3>
          <button type="button" className="btn btn-secundario" onClick={agregarItem}>
            ➕ Agregar item
          </button>
        </div>

        <div className="tabla-contenedor">
          <table className="tabla-items">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item, indice) => (
                <tr key={`item-${indice}`}>
                  <td>
                    <input
                      type="text"
                      value={item.descripcion}
                      onChange={(e) => cambiarItem(indice, 'descripcion', e.target.value)}
                      placeholder="Descripción del item"
                      maxLength={200}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={item.cantidad}
                      onChange={(e) => cambiarItem(indice, 'cantidad', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.precioUnitario}
                      onChange={(e) => cambiarItem(indice, 'precioUnitario', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </td>
                  <td className="celda-subtotal">$ {formatearMonto(subtotalDe(item))}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-peligro btn-mini"
                      onClick={() => quitarItem(indice)}
                      disabled={items.length === 1}
                      title={items.length === 1 ? 'La factura debe tener al menos un item' : 'Quitar item'}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="total-estimado">
          Total estimado: <strong>$ {formatearMonto(totalEstimado)}</strong>{' '}
          <span className="nota-total">(el total definitivo lo calcula el dominio)</span>
        </p>

        <div className="form-botones">
          <button type="submit" className="btn btn-primario" disabled={cargando}>
            {cargando ? 'Emitiendo...' : 'Emitir factura'}
          </button>
          <button type="button" className="btn btn-secundario" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default FacturaModalForm;
