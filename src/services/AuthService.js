import axios from 'axios';

const API_URL = 'http://localhost:8080/api/usuarios';
const TOKEN_KEY = 'jwt_token';
const NOMBRE_KEY = 'usuario_nombre';

/**
 * Servicio de autenticación del frontend.
 * Guarda el token JWT en localStorage y expone helpers de sesión.
 */
const AuthService = {
  /** Login contra el backend. Guarda el token si la respuesta es exitosa. */
  async login(email, password) {
    const respuesta = await axios.post(`${API_URL}/login`, { email, password });
    const datos = respuesta.data;
    this.saveToken(datos.token);
    localStorage.setItem(NOMBRE_KEY, datos.nombre || '');
    return datos;
  },

  /** Registro contra el backend. Guarda el token si la respuesta es exitosa. */
  async registro(nombre, email, password) {
    const respuesta = await axios.post(`${API_URL}/registro`, { nombre, email, password });
    const datos = respuesta.data;
    this.saveToken(datos.token);
    localStorage.setItem(NOMBRE_KEY, datos.nombre || '');
    return datos;
  },

  saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  nombreUsuario() {
    return localStorage.getItem(NOMBRE_KEY) || 'usuario';
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NOMBRE_KEY);
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default AuthService;
