import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import TarjetaModalForm from '../TarjetaModalForm/TarjetaModalForm';
import FacturaModalForm from '../FacturaModalForm/FacturaModalForm';
import '../../styles/ClienteList.css';
import '../../styles/ClienteDetalle.css';

/**
 * Detalle del AGREGADO Cliente: datos propios (nombre, CUIT) + sus tarjetas
 * de crédito y sus facturas con items.
 *
 * Desde este pop-up se agregan tarjetas y facturas: son operaciones de negocio
 * del agregado (POST /api/clientes/{id}/tarjetas y /api/clientes/{id}/facturas),
 * cuyo resultado es el agregado completo actualizado.
 */
function ClienteDetalle({ cliente, onCerrar, onCambio }) {
  const [actual, setActual] = useState(cliente);
  const [modalTarjeta, setModalTarjeta] = useState(false);
  const [modalFactura, setModalFactura] = useState(false);
  const [aviso, setAviso] = useState('');

  const actualizar = (clienteActualizado, mensaje) => {
    setActual(clienteActualizado);
    setAviso(mensaje);
    if (onCambio) {
      onCambio(clienteActualizado);
    }
  };

  const formatearMonto = (monto) => {
    if (monto === null || monto === undefined) return '-';
    return Number(monto).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatearFecha = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('es-AR');
    } catch {
      return String(iso);
    }
  };

  const tarjetas = actual.tarjetas || [];
  const facturas = actual.facturas || [];

  return (
    <Modal titulo={`👤 Cliente #${actual.id} · ${actual.nombre}`} onCerrar={onCerrar} ancho="ancho">
      {aviso && <div className="alerta alerta-ok">{aviso}</div>}

      <div className="detalle-datos">
        <div>
          <span className="detalle-etiqueta">Nombre</span>
          <strong>{actual.nombre}</strong>
        </div>
        <div>
          <span className="detalle-etiqueta">CUIT</span>
          <strong>{actual.cuit}</strong>
        </div>
        <div>
          <span className="detalle-etiqueta">Tarjetas</span>
          <strong>{tarjetas.length}</strong>
        </div>
        <div>
          <span className="detalle-etiqueta">Facturas</span>
          <strong>{facturas.length}</strong>
        </div>
      </div>

      <div className="detalle-bloque">
        <div className="detalle-bloque-cabecera">
          <h3>💳 Tarjetas de crédito ({tarjetas.length})</h3>
          <button type="button" className="btn btn-primario" onClick={() => setModalTarjeta(true)}>
            ➕ Solicitar tarjeta
          </button>
        </div>

        {tarjetas.length === 0 ? (
          <p className="detalle-vacio">
            El cliente todavía no tiene tarjetas. El límite acumulado no puede superar los $ 2.000.000.
          </p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla-mini">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número</th>
                  <th>Marca</th>
                  <th>Límite</th>
                  <th>Utilizado</th>
                  <th>Disponible</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tarjetas.map((tarjeta) => (
                  <tr key={tarjeta.id}>
                    <td>{tarjeta.id}</td>
                    <td>{tarjeta.numeroMascara}</td>
                    <td>{tarjeta.marca}</td>
                    <td>$ {formatearMonto(tarjeta.limiteCredito)}</td>
                    <td>$ {formatearMonto(tarjeta.saldoUtilizado)}</td>
                    <td>$ {formatearMonto(tarjeta.creditoDisponible)}</td>
                    <td>{tarjeta.fechaVencimiento || '-'}</td>
                    <td>
                      <span
                        className={`badge ${tarjeta.estado === 'ACTIVA' ? 'badge-activo' : 'badge-bloqueada'}`}
                      >
                        {tarjeta.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="detalle-bloque">
        <div className="detalle-bloque-cabecera">
          <h3>🧾 Facturas ({facturas.length})</h3>
          <button type="button" className="btn btn-primario" onClick={() => setModalFactura(true)}>
            ➕ Emitir factura
          </button>
        </div>

        {facturas.length === 0 ? (
          <p className="detalle-vacio">
            El cliente todavía no tiene facturas. El monto total lo calcula el dominio sumando los items.
          </p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla-mini">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número</th>
                  <th>Emisión</th>
                  <th>Monto total</th>
                  <th>Estado</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((factura) => (
                  <React.Fragment key={factura.id}>
                    <tr>
                      <td>{factura.id}</td>
                      <td>{factura.numeroFactura}</td>
                      <td>{formatearFecha(factura.fechaEmision)}</td>
                      <td>$ {formatearMonto(factura.montoTotal)}</td>
                      <td>
                        <span
                          className={`badge ${factura.estado === 'PAGADA' ? 'badge-activo' : 'badge-pendiente'}`}
                        >
                          {factura.estado}
                        </span>
                      </td>
                      <td>{(factura.items || []).length}</td>
                    </tr>
                    <tr className="fila-items">
                      <td colSpan={6}>
                        <table className="tabla-mini tabla-items-anidada">
                          <thead>
                            <tr>
                              <th>Descripción</th>
                              <th>Cantidad</th>
                              <th>Precio unitario</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(factura.items || []).map((item, indice) => (
                              <tr key={`${factura.id}-item-${indice}`}>
                                <td>{item.descripcion}</td>
                                <td>{item.cantidad}</td>
                                <td>$ {formatearMonto(item.precioUnitario)}</td>
                                <td className="celda-subtotal">$ {formatearMonto(item.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalTarjeta && (
        <TarjetaModalForm
          cliente={actual}
          onAgregada={(clienteActualizado) => {
            setModalTarjeta(false);
            actualizar(clienteActualizado, 'Tarjeta solicitada correctamente');
          }}
          onCerrar={() => setModalTarjeta(false)}
        />
      )}

      {modalFactura && (
        <FacturaModalForm
          cliente={actual}
          onEmitida={(clienteActualizado) => {
            setModalFactura(false);
            actualizar(clienteActualizado, 'Factura emitida correctamente');
          }}
          onCerrar={() => setModalFactura(false)}
        />
      )}
    </Modal>
  );
}

export default ClienteDetalle;

