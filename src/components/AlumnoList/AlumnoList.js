import React, { useEffect, useState } from 'react';
import AlumnoService, { mensajeDeError } from '../../services/AlumnoService';
import '../../styles/AlumnoList.css';

/**
 * Tabla de alumnos con acciones editar/eliminar y filtro por estado.
 * El listado se recarga al cambiar `refrescar` (tras crear/guardar/eliminar).
 */
function AlumnoList({ refrescar, onEditar, onCambio, onSesionExpirada }) {
  const [alumnos, setAlumnos] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refrescar, filtro]);

  const cargar = async () => {
    setError('');
    setMensaje('');
    setCargando(true);
    try {
      const respuesta =
        filtro === 'TODOS'
          ? await AlumnoService.listar()
          : await AlumnoService.listarPorEstado(filtro);
      setAlumnos(respuesta.data);
    } catch (err) {
      // 403 = sesión no válida -> volver al login
      if (err.response && err.response.status === 403 && onSesionExpirada) {
        onSesionExpirada();
        return;
      }
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (alumno) => {
    setError('');
    setMensaje('');
    if (!window.confirm(`¿Eliminar al alumno "${alumno.nombre} ${alumno.apellido}"?`)) {
      return;
    }
    try {
      await AlumnoService.eliminar(alumno.id);
      setMensaje(`Alumno #${alumno.id} eliminado correctamente`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('El alumno ya no existe (404). Actualizando el listado...');
      } else {
        setError(mensajeDeError(err));
      }
    } finally {
      onCambio(); // recarga la tabla
    }
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
    <section className="tarjeta lista-alumnos">
      <div className="lista-cabecera">
        <h2>📋 Listado de alumnos</h2>
        <div className="filtros">
          <label>Filtrar por estado: </label>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="TODOS">TODOS</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>
      </div>

      {error && <div className="alerta alerta-error">{error}</div>}
      {mensaje && <div className="alerta alerta-ok">{mensaje}</div>}
      {cargando && <p className="cargando">Cargando alumnos...</p>}

      {!cargando && alumnos.length === 0 && !error && (
        <p className="vacio">No hay alumnos para mostrar. Creá el primero con el formulario de arriba 👆</p>
      )}

      {!cargando && alumnos.length > 0 && (
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
              {alumnos.map((alumno) => (
                <tr key={alumno.id}>
                  <td>{alumno.id}</td>
                  <td>{alumno.nombre}</td>
                  <td>{alumno.apellido}</td>
                  <td>{alumno.email}</td>
                  <td>{alumno.telefono || '-'}</td>
                  <td>
                    <span className={`badge ${alumno.estado === 'ACTIVO' ? 'badge-activo' : 'badge-inactivo'}`}>
                      {alumno.estado}
                    </span>
                  </td>
                  <td>{formatearFecha(alumno.fechaInscripcion)}</td>
                  <td className="acciones">
                    <button className="btn btn-editar" onClick={() => onEditar(alumno)}>
                      Editar
                    </button>
                    <button className="btn btn-peligro" onClick={() => eliminar(alumno)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AlumnoList;
