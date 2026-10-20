import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { mensajeError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MAX_POR_LIBRO, useCarrito } from '../context/CarritoContext';
import SelectorCantidad from '../components/SelectorCantidad';
import { formatearPrecio } from '../config';
import Portada from '../components/Portada';
import Estrellas from '../components/Estrellas';
import TarjetaLibro from '../components/TarjetaLibro';
import Aviso from '../components/Aviso';

const formatoFecha = new Intl.DateTimeFormat('es', { dateStyle: 'long' });

export default function DetalleLibro() {
  const { id } = useParams();
  return <Detalle key={id} id={id} />;
}

function Detalle({ id }) {
  const [libro, setLibro] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    return api.get(`/libros/${id}`)
      .then(({ data }) => {
        setLibro(data);
        document.title = `${data.titulo} | LibroGest`;
      })
      .catch((err) => setError(mensajeError(err)));
  }, [id]);

  useEffect(() => {
    cargar();
    return () => { document.title = 'LibroGest'; };
  }, [cargar]);

  if (error) {
    return (
      <div className="vacio">
        <h1>No encontramos este libro</h1>
        <p>{error}. Puede que se haya retirado del catálogo.</p>
        <Link to="/" className="boton boton--primario">Ir al catálogo</Link>
      </div>
    );
  }
  if (!libro) return <DetalleEsqueleto />;

  const autorPrincipal = libro.autores[0];

  return (
    <>
      <nav className="migas" aria-label="Ruta">
        <ol>
          <li><Link to="/">Catálogo</Link></li>
          {libro.categoria && (
            <li><Link to={`/?categoria=${libro.categoria.slug}`}>{libro.categoria.nombre}</Link></li>
          )}
          <li aria-current="page">{libro.titulo}</li>
        </ol>
      </nav>

      <article className="detalle">
        <div className="detalle__portada">
          <Portada libro={libro} grande />
        </div>

        <div className="detalle__info">
          <h1 className="detalle__titulo">{libro.titulo}</h1>
          <p className="detalle__autores">
            de{' '}
            {libro.autores.map((a, i) => (
              <span key={a._id}>
                {i > 0 && (i === libro.autores.length - 1 ? ' y ' : ', ')}
                <Link to={`/?autor=${a._id}`} className="enlace-sutil">{a.nombre}</Link>
              </span>
            ))}
          </p>

          {libro.numValoraciones > 0 && (
            <a href="#valoraciones" className="detalle__nota">
              <Estrellas valor={libro.valoracionMedia} total={libro.numValoraciones} />
            </a>
          )}

          <Compra libro={libro} />

          {libro.descripcion && <p className="detalle__descripcion">{libro.descripcion}</p>}

          <dl className="ficha">
            {libro.editorial && (<div><dt>Editorial</dt><dd>{libro.editorial}</dd></div>)}
            {libro.anioPublicacion && (<div><dt>Publicado en</dt><dd>{libro.anioPublicacion}</dd></div>)}
            <div><dt>ISBN</dt><dd>{libro.isbn}</dd></div>
            {libro.categoria && (<div><dt>Categoría</dt><dd>{libro.categoria.nombre}</dd></div>)}
          </dl>
        </div>
      </article>

      {/* La key reinicia el formulario cada vez que el libro se guarda */}
      <Valoraciones key={libro.updatedAt} libro={libro} onCambio={cargar} />

      {autorPrincipal && <MasDelAutor autor={autorPrincipal} excluir={libro._id} />}
    </>
  );
}

function Compra({ libro }) {
  const { agregar, cantidadDe } = useCarrito();
  const enCarrito = cantidadDe(libro._id);
  const disponibles = Math.max(0, Math.min(MAX_POR_LIBRO, libro.stock) - enCarrito);
  const [cantidad, setCantidad] = useState(1);
  const [añadidas, setAñadidas] = useState(0);

  function añadir() {
    const n = agregar(libro, Math.min(cantidad, disponibles));
    setAñadidas(n);
    setCantidad(1);
  }

  return (
    <div className="compra">
      <div className="compra__fila">
        <p className="precio precio--grande">{formatearPrecio(libro.precio)}</p>
        <p className={`disponibilidad${libro.stock === 0 ? ' disponibilidad--agotado' : ''}`}>
          <span className="disponibilidad__punto" aria-hidden="true" />
          {libro.stock === 0
            ? 'Agotado por ahora'
            : libro.stock <= 5
              ? `Quedan ${libro.stock} ejemplares`
              : 'En stock, listo para enviar'}
        </p>
      </div>

      {libro.stock > 0 && (
        disponibles > 0 ? (
          <div className="compra__acciones">
            <SelectorCantidad valor={Math.min(cantidad, disponibles)} max={disponibles} onCambiar={setCantidad} />
            <button type="button" className="boton boton--primario compra__boton" onClick={añadir}>
              Añadir al carrito
            </button>
          </div>
        ) : (
          <p className="nota">Ya tienes en el carrito todos los ejemplares que puedes pedir.</p>
        )
      )}

      {(añadidas > 0 || enCarrito > 0) && (
        <p className="compra__aviso" role="status">
          {añadidas > 0
            ? `${añadidas === 1 ? 'Añadido' : `${añadidas} añadidos`} al carrito. `
            : `Tienes ${enCarrito} en el carrito. `}
          <Link to="/carrito">Ver carrito</Link>
        </p>
      )}
    </div>
  );
}

function DetalleEsqueleto() {
  return (
    <div className="detalle" aria-busy="true" aria-label="Cargando libro">
      <div className="detalle__portada"><div className="portada portada--grande esqueleto" /></div>
      <div className="detalle__info">
        <div className="esqueleto esqueleto--titulo" />
        <div className="esqueleto esqueleto--linea esqueleto--corta" />
        <div className="esqueleto esqueleto--bloque" />
      </div>
    </div>
  );
}

function ResumenValoraciones({ valoraciones, media }) {
  const conteo = [5, 4, 3, 2, 1].map((n) => ({
    n,
    total: valoraciones.filter((v) => v.puntuacion === n).length,
  }));
  return (
    <div className="resumen-notas">
      <p className="resumen-notas__media">
        {media.toLocaleString('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        <span>de 5</span>
      </p>
      <Estrellas valor={media} total={valoraciones.length} />
      <ul className="resumen-notas__barras">
        {conteo.map(({ n, total }) => (
          <li key={n}>
            <span>{n} ★</span>
            <span className="barra"><span style={{ width: `${(total / valoraciones.length) * 100}%` }} /></span>
            <span className="barra__total">{total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Valoraciones({ libro, onCambio }) {
  const { usuario, esAdmin } = useAuth();
  const propia = usuario && libro.valoraciones.find((v) => v.usuario?._id === usuario._id);

  const [puntuacion, setPuntuacion] = useState(propia?.puntuacion ?? 0);
  const [comentario, setComentario] = useState(propia?.comentario ?? '');
  const [editando, setEditando] = useState(!propia);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!puntuacion) {
      setError('Elige de 1 a 5 estrellas antes de publicar');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await api.post(`/libros/${libro._id}/valoraciones`, { puntuacion, comentario: comentario.trim() });
      await onCambio();
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  }

  async function eliminar(idValoracion) {
    if (!window.confirm('¿Eliminar esta valoración? No se puede deshacer.')) return;
    try {
      await api.delete(`/libros/${libro._id}/valoraciones/${idValoracion}`);
      await onCambio();
    } catch (err) {
      setError(mensajeError(err));
    }
  }

  return (
    <section className="valoraciones" id="valoraciones" aria-labelledby="titulo-valoraciones">
      <h2 id="titulo-valoraciones">Opiniones de lectores</h2>

      <div className="valoraciones__rejilla">
        <div className="valoraciones__lateral">
          {libro.valoraciones.length > 0 && (
            <ResumenValoraciones valoraciones={libro.valoraciones} media={libro.valoracionMedia} />
          )}

          {!usuario && (
            <div className="invitacion">
              <p>¿Lo has leído? Cuéntanos qué te pareció.</p>
              <Link to="/login" state={{ desde: `/libros/${libro._id}` }} className="boton boton--secundario">
                Inicia sesión para opinar
              </Link>
            </div>
          )}

          {usuario && editando && (
            <form className="formulario opinion" onSubmit={enviar}>
              <h3>{propia ? 'Editar tu opinión' : 'Escribe tu opinión'}</h3>
              <fieldset className="selector-estrellas">
                <legend>Tu puntuación</legend>
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className={n <= puntuacion ? 'activa' : ''}>
                    <input
                      type="radio"
                      name="puntuacion"
                      value={n}
                      checked={puntuacion === n}
                      onChange={() => setPuntuacion(n)}
                    />
                    <span aria-hidden="true">★</span>
                    <span className="sr-only">{n === 1 ? '1 estrella' : `${n} estrellas`}</span>
                  </label>
                ))}
              </fieldset>
              <label>
                Comentario <small>(opcional)</small>
                <textarea rows="4" value={comentario} onChange={(e) => setComentario(e.target.value)} />
              </label>
              <Aviso>{error}</Aviso>
              <div className="formulario__acciones">
                <button type="submit" className="boton boton--primario" disabled={enviando}>
                  {enviando ? 'Publicando…' : propia ? 'Guardar cambios' : 'Publicar opinión'}
                </button>
                {propia && (
                  <button type="button" className="boton boton--fantasma" onClick={() => setEditando(false)}>Cancelar</button>
                )}
              </div>
            </form>
          )}
        </div>

        <div>
          {libro.valoraciones.length === 0 ? (
            <p className="nota">Este libro aún no tiene opiniones.{usuario && ' Puedes escribir la primera.'}</p>
          ) : (
            <ul className="opiniones">
              {libro.valoraciones.map((v) => {
                const esPropia = usuario && v.usuario?._id === usuario._id;
                return (
                  <li key={v._id} className={esPropia ? 'opiniones__propia' : undefined}>
                    <header>
                      <span className="avatar" aria-hidden="true">{(v.usuario?.nombre ?? '?').charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{esPropia ? 'Tu opinión' : v.usuario?.nombre ?? 'Lector anónimo'}</strong>
                        <time dateTime={v.fecha}>{formatoFecha.format(new Date(v.fecha))}</time>
                      </div>
                      <Estrellas valor={v.puntuacion} />
                    </header>
                    {v.comentario && <p>{v.comentario}</p>}
                    {(esPropia || esAdmin) && (
                      <div className="opiniones__acciones">
                        {esPropia && !editando && (
                          <button type="button" className="enlace" onClick={() => setEditando(true)}>Editar</button>
                        )}
                        <button type="button" className="enlace enlace--peligro" onClick={() => eliminar(v._id)}>Eliminar</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function MasDelAutor({ autor, excluir }) {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    api.get(`/libros?autor=${autor._id}&limit=5`)
      .then(({ data }) => setLibros(data.datos.filter((l) => l._id !== excluir).slice(0, 4)))
      .catch(() => {});
  }, [autor._id, excluir]);

  if (libros.length === 0) return null;
  return (
    <section className="relacionados" aria-labelledby="titulo-relacionados">
      <h2 id="titulo-relacionados">Más de {autor.nombre}</h2>
      <div className="rejilla rejilla--fila">
        {libros.map((l) => <TarjetaLibro key={l._id} libro={l} />)}
      </div>
    </section>
  );
}
