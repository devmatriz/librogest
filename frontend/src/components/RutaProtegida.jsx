import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Cargando from './Cargando';

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, cargando, esAdmin } = useAuth();
  const location = useLocation();

  if (cargando) return <Cargando />;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />;
  return children;
}
