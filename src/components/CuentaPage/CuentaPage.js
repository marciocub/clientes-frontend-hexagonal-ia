import React, { useEffect, useState } from 'react';
import CuentaService, { mensajeDeError } from '../../services/CuentaService';
import CuentaModalForm from '../CuentaModalForm/CuentaModalForm';
import '../../styles/ClienteList.css';

/**
 * ABM de cuentas: grilla con filtro por estado, alta y edicion en pop-up (modal),
 * eliminacion con confirmacion.
 */
function CuentaPage({ onSesionExpirada }) {
  const [cuentas, setCuentas] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState(null);

  const cargar = async () => {
    setError('');
    setMensaje('');
    setCargando(true);
    try {
      const respuesta =
        filtro === 'TODOS'
          ? await CuentaService.listar()
          : await CuentaService.listarPorEstado(filtro);
      setCuentas(respuesta.data);
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
  }, [filtro]);

  const eliminar = async (cuenta) => {
    setError('');
    setMensaje('');
    if (!window.confirm(`¿Eliminar la cuenta "${cuenta.numeroCuenta}"?`)) {
      return;
    }
    try {
      await CuentaService.eliminar(cuenta.id);
      setMensaje(`Cuenta #${cuenta.id} eliminada correctamente`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('La cuenta ya no existe (404). Actualizando el listado...');
      } else {
        setError(mensajeDeError(err));
      }
    } finally {
      cargar();
    }
  };

  const abrirNuevo = () => {
    setCuentaEditando(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (cuenta) => {
    setCuentaEditando(cuenta);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCuentaEditando(null);
  };

  const trasGuardado = () => {
    cerrarModal();
    cargar();
    setMensaje('Cuenta guardada correctamente');
  };

  const formatearSaldo = (saldo, moneda) => {
    if (saldo === null || saldo === undefined) return '-';
    try {
      return `${Number(saldo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ${moneda || ''}`.trim();
    } catch {
      return String(saldo);
    }
  };

  return (
    <section className="tarjeta lista-clientes">
      <div className="lista-cabecera">
        <h2>💰 Listado de cuentas</h2>
        <div className="filtros">
          <label>Filtrar por estado: </label>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="TODOS">TODOS</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
          <button className="btn btn-primario" onClick={abrirNuevo}>
            ➕ Nueva cuenta
          </button>
        </div>
      </div>

      {error && <div className="alerta alerta-error">{error}</div>}
      {mensaje && <div className="alerta alerta-ok">{mensaje}</div>}
      {cargando && <p className="cargando">Cargando cuentas...</p>}

      {!cargando && cuentas.length === 0 && !error && (
        <p className="vacio">No hay cuentas para mostrar. Creá la primera con el botón "➕ Nueva cuenta" 👆</p>
      )}

      {!cargando && cuentas.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>N° de cuenta</th>
                <th>Cliente ID</th>
                <th>Saldo</th>
                <th>Moneda</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((cuenta) => (
                <tr key={cuenta.id}>
                  <td>{cuenta.id}</td>
                  <td>{cuenta.numeroCuenta}</td>
                  <td>{cuenta.clienteId}</td>
                  <td>{formatearSaldo(cuenta.saldo, cuenta.moneda)}</td>
                  <td>{cuenta.moneda}</td>
                  <td>
                    <span className={`badge ${cuenta.estado === 'ACTIVO' ? 'badge-activo' : 'badge-inactivo'}`}>
                      {cuenta.estado}
                    </span>
                  </td>
                  <td className="acciones">
                    <button className="btn btn-editar" onClick={() => abrirEdicion(cuenta)}>
                      Editar
                    </button>
                    <button className="btn btn-peligro" onClick={() => eliminar(cuenta)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <CuentaModalForm
          cuentaAEditar={cuentaEditando}
          onGuardado={trasGuardado}
          onCerrar={cerrarModal}
        />
      )}
    </section>
  );
}

export default CuentaPage;