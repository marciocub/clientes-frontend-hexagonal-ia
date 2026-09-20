import axios from 'axios';
import AuthService from './AuthService';

/**
 * Cliente Axios para el ABM de clientes con interceptor de JWT.
 *
 * - Request: agrega el header "Authorization: Bearer <token>" a cada petición.
 * - Response: si llega 401 (token inválido/expirado) hace logout automático
 *   y redirige al login.
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

// Interceptor de respuestas: 401 -> logout automático
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

const ClienteService = {
  listar: () => api.get('/clientes'),
  obtenerPorId: (id) => api.get(`/clientes/${id}`),
  listarPorEstado: (estado) => api.get(`/clientes/estado/${estado}`),
  crear: (cliente) => api.post('/clientes', cliente),
  actualizar: (id, cliente) => api.put(`/clientes/${id}`, cliente),
  eliminar: (id) => api.delete(`/clientes/${id}`),
};

export default ClienteService;
