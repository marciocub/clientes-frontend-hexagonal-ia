import React, { useEffect, useState } from 'react';
import ClienteService, { mensajeDeError } from '../../services/ClienteService';
import ClienteModalForm from '../ClienteModalForm/ClienteModalForm';
import '../../styles/ClienteList.css';

/**
 * ABM de clientes: grilla con filtro por estado, alta y edicion en pop-up (modal),
 * eliminacion con confirmacion.
 */
function ClientePage({ onSesionExpirada }) {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const cargar = async () => {
    setError('');
    setMensaje('');
    setCargando(true);
    try {
      const respuesta =
        filtro === 'TODOS'
          ? await ClienteService.listar()
          : await ClienteService.listarPorEstado(filtro);
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
  }, [filtro]);

  const eliminar = async (cliente) => {
    setError('');
    setMensaje('');
    if (!window.confirm(`¿Eliminar al cliente "${cliente.nombre} ${cliente.apellido}"?`)) {
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
    setModalAbierto(true);
  };

  const abrirEdicion = (cliente) => {
    setClienteEditando(cliente);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setClienteEditando(null);
  };

  const trasGuardado = () => {
    cerrarModal();
    cargar();
    setMensaje('Cliente guardado correctamente');
  };

  const formatearFecha = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('es-AR');
    } catch {
      return iso;
    }
  };

  return (
    <section className="tarjeta lista-clientes">
      <div className="lista-cabecera">
        <h2>📋 Listado de clientes</h2>
        <div className="filtros">
          <label>Filtrar por estado: </label>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="TODOS">TODOS</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
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
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Inscripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.apellido}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefono || '-'}</td>
                  <td>
                    <span className={`badge ${cliente.estado === 'ACTIVO' ? 'badge-activo' : 'badge-inactivo'}`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td>{formatearFecha(cliente.fechaInscripcion)}</td>
                  <td className="acciones">
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

      {modalAbierto && (
        <ClienteModalForm
          clienteAEditar={clienteEditando}
          onGuardado={trasGuardado}
          onCerrar={cerrarModal}
        />
      )}
    </section>
  );
}

export default ClientePage;