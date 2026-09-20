import React, { useEffect, useRef, useState } from 'react';
import AuthService from './services/AuthService';
import Login from './components/Login/Login';
import Registro from './components/Registro/Registro';
import HomePage from './components/HomePage/HomePage';
import ClientePage from './components/ClientePage/ClientePage';
import CuentaPage from './components/CuentaPage/CuentaPage';

/**
 * Componente raiz:
 * - Si hay token JWT en localStorage -> muestra la app con homepage y menu desplegable.
 * - Si no hay token -> muestra Login o Registro.
 * - El menu "ABM" despliega las entidades: Clientes y Cuentas.
 * - "Cerrar sesión" borra el token y vuelve al login.
 */
function App() {
  const [logueado, setLogueado] = useState(AuthService.isAuthenticated());
  const [vistaAuth, setVistaAuth] = useState('login'); // 'login' | 'registro'
  const [vista, setVista] = useState('home'); // 'home' | 'clientes' | 'cuentas'
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cierra el menu SOLO al hacer clic fuera, con Escape o al elegir una opcion.
  // NO se cierra con mouseleave: el desplegable tiene un hueco respecto al
  // boton y el mouse sale del area del nav antes de llegar a las opciones.
  useEffect(() => {
    if (!menuAbierto) return undefined;
    const manejarClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    const manejarEscape = (e) => {
      if (e.key === 'Escape') {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', manejarClickFuera);
    document.addEventListener('keydown', manejarEscape);
    return () => {
      document.removeEventListener('mousedown', manejarClickFuera);
      document.removeEventListener('keydown', manejarEscape);
    };
  }, [menuAbierto]);

  const cerrarSesion = () => {
    AuthService.logout();
    setLogueado(false);
    setVistaAuth('login');
    setVista('home');
  };

  const irA = (destino) => {
    setVista(destino);
    setMenuAbierto(false);
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

  const opcionesMenu = [
    { id: 'clientes', icono: '👥', texto: 'Clientes' },
    { id: 'cuentas', icono: '💰', texto: 'Cuentas' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎓 Gestión de Clientes y Cuentas</h1>

        <nav className="menu" ref={menuRef}>
          <button
            type="button"
            className={`btn-menu ${menuAbierto ? 'btn-menu-abierto' : ''}`}
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-haspopup="true"
            aria-expanded={menuAbierto}
          >
            ☰ ABM <span className="menu-flecha">{menuAbierto ? '▲' : '▼'}</span>
          </button>
          {menuAbierto && (
            <ul className="menu-desplegable">
              {opcionesMenu.map((opcion) => (
                <li key={opcion.id}>
                  <button
                    type="button"
                    className={`menu-opcion ${vista === opcion.id ? 'menu-opcion-activa' : ''}`}
                    onClick={() => irA(opcion.id)}
                  >
                    <span className="menu-opcion-icono">{opcion.icono}</span>
                    {opcion.texto}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <span className="app-usuario">Sesión: {AuthService.nombreUsuario()}</span>
        <button className="btn btn-peligro" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <main className="app-main">
        {vista === 'home' && <HomePage onIrA={irA} nombreUsuario={AuthService.nombreUsuario()} />}
        {vista === 'clientes' && <ClientePage onSesionExpirada={cerrarSesion} />}
        {vista === 'cuentas' && <CuentaPage onSesionExpirada={cerrarSesion} />}
      </main>

      <footer className="app-footer">
        Arquitectura Hexagonal + JWT · Spring Boot 4 (puerto 8080) + React 18 (puerto 3000)
      </footer>
    </div>
  );
}

export default App;