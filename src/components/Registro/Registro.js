import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { mensajeDeError } from '../../services/AlumnoService';
import '../../styles/Registro.css';

/**
 * Formulario de registro. El backend hashea la contraseña con BCrypt
 * y devuelve un token JWT (201). Si el email está duplicado responde 409.
 */
function Registro({ onRegistrado, onIrALogin }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCargando(true);
    try {
      await AuthService.registro(nombre.trim(), email.trim(), password);
      onRegistrado();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Ese email ya está registrado (409). Probá con otro o iniciá sesión.');
      } else if (err.response && err.response.status === 400) {
        setError(mensajeDeError(err)); // validaciones del backend
      } else {
        setError(mensajeDeError(err));
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-contenedor">
      <form className="auth-tarjeta" onSubmit={enviar}>
        <h2>📝 Crear cuenta</h2>
        <p className="auth-subtitulo">Registrate para empezar a usar el ABM</p>

        {error && <div className="alerta alerta-error">{error}</div>}

        <label htmlFor="reg-nombre">Nombre</label>
        <input
          id="reg-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          maxLength={100}
          required
        />

        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          maxLength={100}
          required
        />

        <label htmlFor="reg-password">Contraseña (mínimo 6 caracteres)</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          minLength={6}
          maxLength={100}
          required
        />

        <button className="btn btn-primario" type="submit" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrarme'}
        </button>

        <p className="auth-link">
          ¿Ya tenés cuenta?{' '}
          <button type="button" className="link-btn" onClick={onIrALogin}>
            Ingresá acá
          </button>
        </p>
      </form>
    </div>
  );
}

export default Registro;
