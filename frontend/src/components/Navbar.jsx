import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';

export default function Navbar() {
  const { usuario } = useAuth();
  const { unidades } = useCarrito();
  const location = useLocation();
  const [params] = useSearchParams();
  const qActual = location.pathname === '/' ? params.get('q') ?? '' : '';

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
          <NavLink
            to="/carrito"
            className="boton-carrito"
            aria-label={unidades ? `Carrito, ${unidades} ${unidades === 1 ? 'libro' : 'libros'}` : 'Carrito vacío'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 7h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9z" />
              <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
            </svg>
            {unidades > 0 && <span className="boton-carrito__cuenta" aria-hidden="true">{unidades}</span>}
          </NavLink>

          {usuario ? (
            // key: el menú se cierra al cambiar de página
            <MenuCuenta key={location.pathname} />
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

function MenuCuenta() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  // Cierra al hacer clic fuera o al pulsar Escape
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => { if (!ref.current?.contains(e.target)) setAbierto(false); };
    const escape = (e) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        ref.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', escape);
    };
  }, [abierto]);

  function salir() {
    logout();
    navigate('/');
  }

  return (
    <div className="menu-cuenta" ref={ref}>
      <button
        type="button"
        className="navbar__usuario"
        aria-expanded={abierto}
        aria-controls="menu-cuenta"
        onClick={() => setAbierto((v) => !v)}
      >
        <span className="avatar" aria-hidden="true">{usuario.nombre.charAt(0).toUpperCase()}</span>
        <span className="navbar__nombre">{usuario.nombre.split(' ')[0]}</span>
        <svg className="menu-cuenta__flecha" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" /></svg>
      </button>
      {abierto && (
        <div className="menu-cuenta__panel" id="menu-cuenta">
          <p className="menu-cuenta__email">{usuario.email}</p>
          <Link to="/pedidos">Mis pedidos</Link>
          <Link to="/perfil">Mi perfil</Link>
          <button type="button" onClick={salir}>Cerrar sesión</button>
        </div>
      )}
    </div>
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
