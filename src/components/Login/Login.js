import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { mensajeDeError } from '../../services/AlumnoService';
import '../../styles/Login.css';

/**
 * Formulario de login. Al ingresar correctamente el backend devuelve
 * un token JWT que AuthService guarda en localStorage.
 */
function Login({ onLogin, onIrARegistro }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await AuthService.login(email.trim(), password);
      onLogin();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Email o contraseña incorrectos');
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
        <h2>🔐 Iniciar sesión</h2>
        <p className="auth-subtitulo">Ingresá para administrar los alumnos</p>

        {error && <div className="alerta alerta-error">{error}</div>}

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />

        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <button className="btn btn-primario" type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="auth-link">
          ¿No tenés cuenta?{' '}
          <button type="button" className="link-btn" onClick={onIrARegistro}>
            Registrate acá
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
