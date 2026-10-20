import axios from 'axios';

const CLAVE_TOKEN = 'librogest_token';

export const tokenStorage = {
  leer: () => {
    try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
  },
  guardar: (token) => {
    try { localStorage.setItem(CLAVE_TOKEN, token); } catch { /* sin almacenamiento */ }
  },
  borrar: () => {
    try { localStorage.removeItem(CLAVE_TOKEN); } catch { /* sin almacenamiento */ }
  },
};

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = tokenStorage.leer();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Convierte un error de la API en un texto para mostrar al usuario
export function mensajeError(err) {
  const datos = err.response?.data;
  if (datos?.errores?.length) return datos.errores.join('. ');
  if (datos?.mensaje) return datos.mensaje;
  if (!err.response) return 'No se pudo conectar con el servidor';
  return 'Ha ocurrido un error inesperado';
}

export default api;
