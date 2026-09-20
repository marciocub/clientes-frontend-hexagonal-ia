import React, { useState } from 'react';
import ClienteService, { mensajeDeError } from '../../services/ClienteService';
import '../../styles/ClienteForm.css';

/**
 * Formulario para crear y editar clientes, con validaciones.
 * Errores manejados: 400 (validaciones del backend), 409 (email duplicado),
 * otros (conexión). El mensaje del backend se muestra en la alerta.
 */
function ClienteForm({ clienteAEditar, onGuardado, onCancelar }) {
  const editando = !!clienteAEditar;
  const [nombre, setNombre] = useState(editando ? clienteAEditar.nombre : '');
  const [apellido, setApellido] = useState(editando ? clienteAEditar.apellido : '');
  const [email, setEmail] = useState(editando ? clienteAEditar.email : '');
  const [telefono, setTelefono] = useState(editando ? clienteAEditar.telefono || '' : '');
  const [estado, setEstado] = useState(editando ? clienteAEditar.estado : 'ACTIVO');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const datos = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      telefono: telefono.trim() || null,
      estado,
    };
    try {
      if (editando) {
        await ClienteService.actualizar(clienteAEditar.id, datos);
      } else {
        await ClienteService.crear(datos);
      }
      onGuardado();
    } catch (err) {
      // 400: validaciones · 409: email duplicado · 403/401: sesión
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="tarjeta form-cliente">
      <h2>{editando ? `✏️ Editar cliente #${clienteAEditar.id}` : '➕ Nuevo cliente'}</h2>

      {error && <div className="alerta alerta-error">{error}</div>}

      <form onSubmit={enviar} className="form-grilla">
        <div className="campo">
          <label htmlFor="al-nombre">Nombre *</label>
          <input
            id="al-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Juan"
            maxLength={100}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="al-apellido">Apellido *</label>
          <input
            id="al-apellido"
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Perez"
            maxLength={100}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="al-email">Email *</label>
          <input
            id="al-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@escuela.com"
            maxLength={100}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="al-telefono">Teléfono</label>
          <input
            id="al-telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="2611234567"
            maxLength={20}
          />
        </div>

        <div className="campo">
          <label htmlFor="al-estado">Estado</label>
          <select id="al-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

        <div className="form-botones">
          <button type="submit" className="btn btn-primario" disabled={cargando}>
            {cargando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear cliente'}
          </button>
          {editando && (
            <button type="button" className="btn btn-secundario" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default ClienteForm;
