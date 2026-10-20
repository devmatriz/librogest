import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(() => !!tokenStorage.leer());

  // Al abrir la app, si hay token guardado, se recupera el perfil
  useEffect(() => {
    if (!tokenStorage.leer()) return;
    api.get('/auth/perfil')
      .then(({ data }) => setUsuario(data))
      .catch(() => tokenStorage.borrar())
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback((data) => {
    tokenStorage.guardar(data.token);
    setUsuario(data.usuario);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    iniciarSesion(data);
  }, [iniciarSesion]);

  const registrar = useCallback(async (datos) => {
    const { data } = await api.post('/auth/register', datos);
    iniciarSesion(data);
  }, [iniciarSesion]);

  const logout = useCallback(() => {
    tokenStorage.borrar();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, setUsuario, cargando, login, registrar, logout, esAdmin: usuario?.rol === 'admin' }),
    [usuario, cargando, login, registrar, logout]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
