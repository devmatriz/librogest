import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mensajeError } from '../services/api';
import Aviso from '../components/Aviso';

export default function Registro() {
  const { usuario, registrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.desde ?? '/';

  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={destino} replace />;

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await registrar({ nombre: form.nombre.trim(), email: form.email, password: form.password });
      navigate(destino, { replace: true });
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  }

  return (
    <div className="panel-acceso">
      <h1>Crear cuenta</h1>
      <p className="panel-acceso__intro">Solo necesitas tu nombre, tu email y una contraseña.</p>
      <form className="formulario" onSubmit={enviar}>
        <label>
          Nombre
          <input autoComplete="name" required value={form.nombre} onChange={cambiar('nombre')} />
        </label>
        <label>
          Email
          <input type="email" autoComplete="email" required value={form.email} onChange={cambiar('email')} />
        </label>
        <label>
          Contraseña
          <input type="password" autoComplete="new-password" required minLength={6} value={form.password} onChange={cambiar('password')} />
          <small>Al menos 6 caracteres</small>
        </label>
        <label>
          Repite la contraseña
          <input type="password" autoComplete="new-password" required value={form.confirmar} onChange={cambiar('confirmar')} />
        </label>
        <Aviso>{error}</Aviso>
        <button type="submit" className="boton boton--primario" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="nota">
        ¿Ya tienes cuenta? <Link to="/login" state={location.state}>Inicia sesión</Link>
      </p>
    </div>
  );
}
