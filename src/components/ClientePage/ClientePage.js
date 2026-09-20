import React, { useEffect, useState } from 'react';
import ClienteService, { mensajeDeError } from '../../services/ClienteService';
import ClienteModalForm from '../ClienteModalForm/ClienteModalForm';
import ClienteDetalle from '../ClienteDetalle/ClienteDetalle';
import '../../styles/ClienteList.css';

/**
 * ABM del AGREGADO Cliente:
 * - Grilla con cada cliente (nombre, CUIT y cantidad de tarjetas/facturas).
 * - Alta y edición en pop-up (ClienteModalForm).
 * - Eliminación con confirmación (arrastra tarjetas y facturas en cascada).
 * - "Ver" abre el detalle del agregado (ClienteDetalle) para administrar
 *   tarjetas de crédito y facturas con items.
 */
function ClientePage({ onSesionExpirada }) {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [formAbierto, setFormAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteDetalle, setClienteDetalle] = useState(null);

  const cargar = async () => {
    setError('');
    setCargando(true);
    try {
      const respuesta = await ClienteService.listar();
      setClientes(respuesta.data);
    } catch (err) {
      if (err.response && err.response.status === 403 && onSesionExpirada) {
        onSesionExpirada();
        return;
      }
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eliminar = async (cliente) => {
    setError('');
    setMensaje('');
    if (
      !window.confirm(
        `¿Eliminar al cliente "${cliente.nombre}" (CUIT ${cliente.cuit})? También se eliminarán sus tarjetas y facturas.`
      )
    ) {
      return;
    }
    try {
      await ClienteService.eliminar(cliente.id);
      setMensaje(`Cliente #${cliente.id} eliminado correctamente`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('El cliente ya no existe (404). Actualizando el listado...');
      } else {
        setError(mensajeDeError(err));
      }
    } finally {
      cargar();
    }
  };

  const abrirNuevo = () => {
    setClienteEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (cliente) => {
    setClienteEditando(cliente);
    setFormAbierto(true);
  };

  const cerrarForm = () => {
    setFormAbierto(false);
    setClienteEditando(null);
  };

  const trasGuardado = () => {
    cerrarForm();
    cargar();
    setMensaje('Cliente guardado correctamente');
  };

  /** Refresca la fila del cliente cuando se agregan tarjetas o facturas. */
  const trasCambioDeAgregado = (clienteActualizado) => {
    setClientes((previos) =>
      previos.map((cliente) => (cliente.id === clienteActualizado.id ? clienteActualizado : cliente))
    );
    setMensaje(`Agregado del cliente #${clienteActualizado.id} actualizado`);
  };

  const formatearMonto = (monto) => {
    if (monto === null || monto === undefined) return '-';
    return Number(monto).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /** Suma de los límites de todas las tarjetas del cliente. */
  const limiteAcumulado = (cliente) =>
    (cliente.tarjetas || []).reduce((acumulado, tarjeta) => acumulado + Number(tarjeta.limiteCredito || 0), 0);


  return (
    <section className="tarjeta lista-clientes">
      <div className="lista-cabecera">
        <h2>👥 Clientes (agregado con tarjetas y facturas)</h2>
        <div className="filtros">
          <button className="btn btn-secundario" onClick={cargar} disabled={cargando}>
            🔄 Actualizar
          </button>
          <button className="btn btn-primario" onClick={abrirNuevo}>
            ➕ Nuevo cliente
          </button>
        </div>
      </div>

      {error && <div className="alerta alerta-error">{error}</div>}
      {mensaje && <div className="alerta alerta-ok">{mensaje}</div>}
      {cargando && <p className="cargando">Cargando clientes...</p>}

      {!cargando && clientes.length === 0 && !error && (
        <p className="vacio">No hay clientes para mostrar. Creá el primero con el botón "➕ Nuevo cliente" 👆</p>
      )}

      {!cargando && clientes.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>CUIT</th>
                <th>Tarjetas</th>
                <th>Límite acumulado</th>
                <th>Facturas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.cuit}</td>
                  <td>
                    <span className="badge badge-activo">{(cliente.tarjetas || []).length}</span>
                  </td>
                  <td>$ {formatearMonto(limiteAcumulado(cliente))}</td>
                  <td>
                    <span className="badge badge-inactivo">{(cliente.facturas || []).length}</span>
                  </td>
                  <td className="acciones">
                    <button className="btn btn-secundario" onClick={() => setClienteDetalle(cliente)}>
                      Ver
                    </button>
                    <button className="btn btn-editar" onClick={() => abrirEdicion(cliente)}>
                      Editar
                    </button>
                    <button className="btn btn-peligro" onClick={() => eliminar(cliente)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formAbierto && (
        <ClienteModalForm
          clienteAEditar={clienteEditando}
          onGuardado={trasGuardado}
          onCerrar={cerrarForm}
        />
      )}

      {clienteDetalle && (
        <ClienteDetalle
          cliente={clienteDetalle}
          onCambio={trasCambioDeAgregado}
          onCerrar={() => setClienteDetalle(null)}
        />
      )}
    </section>
  );
}

export default ClientePage;
