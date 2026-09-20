import React from 'react';

/**
 * Homepage: bienvenida y accesos rapidos a los ABMs.
 * La navegacion la maneja App.js (vista seleccionada), sin react-router.
 */
function HomePage({ onIrA, nombreUsuario }) {
  const accesos = [
    {
      id: 'clientes',
      icono: '👥',
      titulo: 'ABM de Clientes',
      descripcion:
        'Agregado Cliente: alta, baja y modificación de clientes (nombre y CUIT) con sus tarjetas de crédito y facturas.',
    },
    {
      id: 'cuentas',
      icono: '💰',
      titulo: 'ABM de Cuentas',
      descripcion: 'Alta, baja y modificación de cuentas: número, cliente, saldo, moneda y estado.',
    },
  ];

  return (
    <div className="home">
      <section className="tarjeta home-bienvenida">
        <h2>👋 ¡Bienvenido, {nombreUsuario}!</h2>
        <p>
          Usá el menú <strong>ABM ▾</strong> de la barra superior o los accesos directos de abajo
          para administrar las entidades del sistema.
        </p>
      </section>

      <div className="home-tarjetas">
        {accesos.map((acceso) => (
          <button key={acceso.id} className="home-tarjeta" onClick={() => onIrA(acceso.id)}>
            <span className="home-tarjeta-icono">{acceso.icono}</span>
            <span className="home-tarjeta-titulo">{acceso.titulo}</span>
            <span className="home-tarjeta-desc">{acceso.descripcion}</span>
            <span className="home-tarjeta-cta">Abrir →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default HomePage;