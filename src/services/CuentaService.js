import axios from 'axios';
import AuthService from './AuthService';

/**
 * Cliente Axios para el ABM de cuentas con interceptor de JWT.
 * Mismo mecanismo que ClienteService: agrega el token a cada peticion
 * y hace logout automatico si el backend responde 401.
 */
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Interceptor de peticiones: agrega el token JWT
api.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuestas: 401 -> logout automatico
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response && error.response.status === 401 && AuthService.isAuthenticated()) {
      AuthService.logout();
      window.location.href = '/'; // vuelve al login
    }
    return Promise.reject(error);
  }
);

/** Extrae el mensaje de error que devuelve el backend (GlobalExceptionHandler). */
export function mensajeDeError(error) {
  if (error.response && error.response.data) {
    const datos = error.response.data;
    if (datos.mensaje) return datos.mensaje;
    if (datos.message) return datos.message;
  }
  if (error.response && error.response.status === 403) {
    return 'Acceso denegado (403): la sesión no es válida para esta operación.';
  }
  return error.message || 'Error de conexión con el servidor';
}

const CuentaService = {
  listar: () => api.get('/cuentas'),
  obtenerPorId: (id) => api.get(`/cuentas/${id}`),
  listarPorEstado: (estado) => api.get(`/cuentas/estado/${estado}`),
  crear: (cuenta) => api.post('/cuentas', cuenta),
  actualizar: (id, cuenta) => api.put(`/cuentas/${id}`, cuenta),
  eliminar: (id) => api.delete(`/cuentas/${id}`),
};

export default CuentaService;