import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mensajeError } from '../services/api';
import Aviso from '../components/Aviso';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.desde ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={destino} replace />;

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await login(email, password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  }

  return (
    <div className="panel-acceso">
      <h1>Iniciar sesión</h1>
      <p className="panel-acceso__intro">Entra para opinar sobre libros y seguir tus pedidos.</p>
      <form className="formulario" onSubmit={enviar}>
        <label>
          Email
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Contraseña
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <Aviso>{error}</Aviso>
        <button type="submit" className="boton boton--primario" disabled={enviando}>
          {enviando ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>
      <p className="nota">
        ¿Aún no tienes cuenta? <Link to="/registro" state={location.state}>Crear cuenta</Link>
      </p>
    </div>
  );
}
