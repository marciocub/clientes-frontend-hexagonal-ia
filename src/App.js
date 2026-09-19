import React, { useState } from 'react';
import AuthService from './services/AuthService';
import Login from './components/Login/Login';
import Registro from './components/Registro/Registro';
import AlumnoForm from './components/AlumnoForm/AlumnoForm';
import AlumnoList from './components/AlumnoList/AlumnoList';

/**
 * Componente raíz:
 * - Si hay token JWT en localStorage -> muestra el ABM de alumnos.
 * - Si no hay token -> muestra Login o Registro.
 * - "Cerrar sesión" borra el token y vuelve al login.
 */
function App() {
  const [logueado, setLogueado] = useState(AuthService.isAuthenticated());
  const [vistaAuth, setVistaAuth] = useState('login'); // 'login' | 'registro'
  const [alumnoEditando, setAlumnoEditando] = useState(null);
  const [refrescar, setRefrescar] = useState(0);

  const cerrarSesion = () => {
    AuthService.logout();
    setLogueado(false);
    setVistaAuth('login');
    setAlumnoEditando(null);
  };

  if (!logueado) {
    return vistaAuth === 'registro' ? (
      <Registro
        onRegistrado={() => setLogueado(true)}
        onIrALogin={() => setVistaAuth('login')}
      />
    ) : (
      <Login
        onLogin={() => setLogueado(true)}
        onIrARegistro={() => setVistaAuth('registro')}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎓 ABM de Alumnos</h1>
        <span className="app-usuario">Sesión: {AuthService.nombreUsuario()}</span>
        <button className="btn btn-peligro" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <main className="app-main">
        <AlumnoForm
          key={alumnoEditando ? `edit-${alumnoEditando.id}` : 'nuevo'}
          alumnoAEditar={alumnoEditando}
          onGuardado={() => {
            setAlumnoEditando(null);
            setRefrescar((n) => n + 1);
          }}
          onCancelar={() => setAlumnoEditando(null)}
        />
        <AlumnoList
          refrescar={refrescar}
          onEditar={(alumno) => setAlumnoEditando(alumno)}
          onCambio={() => setRefrescar((n) => n + 1)}
          onSesionExpirada={cerrarSesion}
        />
      </main>

      <footer className="app-footer">
        Arquitectura Hexagonal + JWT · Spring Boot 4 (puerto 8080) + React 18 (puerto 3000)
      </footer>
    </div>
  );
}

export default App;
