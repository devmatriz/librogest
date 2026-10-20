import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const qActual = location.pathname === '/' ? params.get('q') ?? '' : '';

  function salir() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="contenedor navbar__interior">
        <Link to="/" className="marca" aria-label="LibroGest, ir al inicio">
          <svg className="marca__icono" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M6 7h8a3 3 0 0 1 3 3v15a2 2 0 0 0-2-2H6zM26 7h-6a3 3 0 0 0-3 3v15a2 2 0 0 1 2-2h7z" />
          </svg>
          <span>LibroGest</span>
        </Link>

        {/* key: el campo se reinicia cuando cambia la búsqueda en la URL */}
        <Buscador key={qActual} inicial={qActual} />

        <nav className="navbar__enlaces" aria-label="Principal">
          {usuario ? (
            <>
              <NavLink to="/perfil" className="navbar__usuario">
                <span className="avatar" aria-hidden="true">{usuario.nombre.charAt(0).toUpperCase()}</span>
                <span className="navbar__nombre">{usuario.nombre.split(' ')[0]}</span>
              </NavLink>
              <button type="button" className="boton boton--fantasma" onClick={salir}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <NavLink to="/login" state={{ desde: location.pathname + location.search }} className="boton boton--fantasma">
                Iniciar sesión
              </NavLink>
              <NavLink to="/registro" className="boton boton--primario navbar__registro">Crear cuenta</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Buscador({ inicial }) {
  const [texto, setTexto] = useState(inicial);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();

  function buscar(e) {
    e.preventDefault();
    // Desde el catálogo se conservan los demás filtros; desde otra página se empieza de cero
    const siguientes = new URLSearchParams(location.pathname === '/' ? params : undefined);
    const q = texto.trim();
    if (q) siguientes.set('q', q);
    else siguientes.delete('q');
    siguientes.delete('page');
    navigate({ pathname: '/', search: siguientes.toString() });
  }

  return (
    <form className="buscador" role="search" onSubmit={buscar}>
      <svg className="buscador__icono" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" />
      </svg>
      <input
        type="search"
        placeholder="Busca por título o tema"
        aria-label="Buscar libros"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
    </form>
  );
}
