import React, { useState } from 'react';
import AuthService from './services/AuthService';
import Login from './components/Login/Login';
import Registro from './components/Registro/Registro';
import ClienteForm from './components/ClienteForm/ClienteForm';
import ClienteList from './components/ClienteList/ClienteList';

/**
 * Componente raíz:
 * - Si hay token JWT en localStorage -> muestra el ABM de clientes.
 * - Si no hay token -> muestra Login o Registro.
 * - "Cerrar sesión" borra el token y vuelve al login.
 */
function App() {
  const [logueado, setLogueado] = useState(AuthService.isAuthenticated());
  const [vistaAuth, setVistaAuth] = useState('login'); // 'login' | 'registro'
  const [clienteEditando, setClienteEditando] = useState(null);
  const [refrescar, setRefrescar] = useState(0);

  const cerrarSesion = () => {
    AuthService.logout();
    setLogueado(false);
    setVistaAuth('login');
    setClienteEditando(null);
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
        <h1>🎓 ABM de Clientes</h1>
        <span className="app-usuario">Sesión: {AuthService.nombreUsuario()}</span>
        <button className="btn btn-peligro" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <main className="app-main">
        <ClienteForm
          key={clienteEditando ? `edit-${clienteEditando.id}` : 'nuevo'}
          clienteAEditar={clienteEditando}
          onGuardado={() => {
            setClienteEditando(null);
            setRefrescar((n) => n + 1);
          }}
          onCancelar={() => setClienteEditando(null)}
        />
        <ClienteList
          refrescar={refrescar}
          onEditar={(cliente) => setClienteEditando(cliente)}
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
