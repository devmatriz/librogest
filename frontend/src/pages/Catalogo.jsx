import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { mensajeError } from '../services/api';
import { formatearPrecio } from '../config';
import Estanteria from '../components/Estanteria';
import Filtros from '../components/Filtros';
import TarjetaLibro, { TarjetaLibroEsqueleto } from '../components/TarjetaLibro';
import Paginacion from '../components/Paginacion';
import Aviso from '../components/Aviso';

const POR_PAGINA = 12;

const ORDENES = [
  ['', 'Novedades'],
  ['valoracion', 'Mejor valorados'],
  ['titulo', 'Título, de la A a la Z'],
  ['precio_asc', 'Precio más bajo'],
  ['precio_desc', 'Precio más alto'],
];

const CLAVES_FILTRO = ['q', 'categoria', 'autor', 'min', 'max', 'disponibles'];

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const [categorias, setCategorias] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [resultado, setResultado] = useState(null); // { consulta, datos, paginacion }
  const [error, setError] = useState('');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [autor, setAutor] = useState(null);

  const valores = Object.fromEntries(params);
  const consulta = params.toString();
  const hayFiltros = CLAVES_FILTRO.some((c) => valores[c]);
  const cargando = resultado?.consulta !== consulta;
  const categoriaActual = categorias.find((c) => c.slug === valores.categoria);

  useEffect(() => {
    api.get('/categorias').then(({ data }) => setCategorias(data)).catch(() => {});
    api.get('/libros?orden=valoracion&limit=16').then(({ data }) => setDestacados(data.datos)).catch(() => {});
  }, []);

  // Nombre del autor cuando se filtra por él (?autor=<id>)
  useEffect(() => {
    if (!valores.autor) return;
    api.get(`/autores/${valores.autor}`).then(({ data }) => setAutor(data)).catch(() => {});
  }, [valores.autor]);
  const autorActual = valores.autor && autor?._id === valores.autor ? autor : null;

  // Cada cambio en la URL vuelve a pedir el catálogo
  useEffect(() => {
    const control = new AbortController();
    api.get(`/libros?limit=${POR_PAGINA}&${consulta}`, { signal: control.signal })
      .then(({ data }) => {
        setResultado({ consulta, ...data });
        setError('');
      })
      .catch((err) => {
        if (err.name === 'CanceledError') return;
        setError(mensajeError(err));
        setResultado((r) => (r ? { ...r, consulta } : r));
      });
    return () => control.abort();
  }, [consulta]);

  function cambiarFiltros(cambios) {
    const siguientes = new URLSearchParams(params);
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === '' || valor === undefined) siguientes.delete(clave);
      else siguientes.set(clave, valor);
    }
    if (!('page' in cambios)) siguientes.delete('page');
    setParams(siguientes);
    setFiltrosAbiertos(false);
  }

  function cambiarPagina(page) {
    cambiarFiltros({ page: page > 1 ? String(page) : '' });
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const limpiar = () => setParams(new URLSearchParams());

  const chips = [
    valores.q && { clave: 'q', texto: `“${valores.q}”` },
    categoriaActual && { clave: 'categoria', texto: categoriaActual.nombre },
    valores.autor && { clave: 'autor', texto: autorActual?.nombre ?? 'Autor' },
    valores.min && { clave: 'min', texto: `Desde ${formatearPrecio(valores.min)}` },
    valores.max && { clave: 'max', texto: `Hasta ${formatearPrecio(valores.max)}` },
    valores.disponibles && { clave: 'disponibles', texto: 'En stock' },
  ].filter(Boolean);

  const titulo = valores.q
    ? `Resultados para “${valores.q}”`
    : autorActual ? `Libros de ${autorActual.nombre}` : categoriaActual?.nombre ?? 'Todos los libros';

  return (
    <>
      {!hayFiltros && !valores.page && destacados.length > 0 && (
        <section className="portada-tienda">
          <div className="portada-tienda__texto">
            <h1>Elige tu próxima lectura</h1>
            <p>Los libros mejor valorados por nuestros lectores. Pulsa un lomo para ver el libro.</p>
          </div>
          <Estanteria libros={destacados} />
        </section>
      )}

      <div className="catalogo" id="resultados">
        <aside className={`catalogo__lateral${filtrosAbiertos ? ' catalogo__lateral--abierto' : ''}`} aria-label="Filtros">
          <div className="catalogo__lateral-cabecera">
            <h2>Filtrar</h2>
            <button type="button" className="boton boton--fantasma" onClick={() => setFiltrosAbiertos(false)}>Cerrar</button>
          </div>
          <Filtros
            key={[valores.min, valores.max].join('|')}
            valores={valores}
            categorias={categorias}
            onCambiar={cambiarFiltros}
          />
        </aside>

        <section className="catalogo__principal" aria-busy={cargando}>
          <header className="catalogo__cabecera">
            <div>
              <h2 className="catalogo__titulo">{titulo}</h2>
              {resultado && (
                <p className="catalogo__cuenta">
                  {resultado.paginacion.total === 1 ? '1 libro' : `${resultado.paginacion.total} libros`}
                </p>
              )}
            </div>
            <div className="catalogo__acciones">
              <button
                type="button"
                className="boton boton--secundario catalogo__abrir-filtros"
                aria-expanded={filtrosAbiertos}
                onClick={() => setFiltrosAbiertos(true)}
              >
                Filtrar{chips.length > 0 && ` (${chips.length})`}
              </button>
              <label className="ordenar">
                <span>Ordenar</span>
                <select value={valores.orden ?? ''} onChange={(e) => cambiarFiltros({ orden: e.target.value })}>
                  {ORDENES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </label>
            </div>
          </header>

          {chips.length > 0 && (
            <ul className="chips" aria-label="Filtros activos">
              {chips.map((c) => (
                <li key={c.clave}>
                  <button type="button" className="chip" onClick={() => cambiarFiltros({ [c.clave]: '' })} aria-label={`Quitar filtro ${c.texto}`}>
                    {c.texto}
                    <svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9" /></svg>
                  </button>
                </li>
              ))}
              {chips.length > 1 && (
                <li><button type="button" className="enlace" onClick={limpiar}>Quitar todos</button></li>
              )}
            </ul>
          )}

          <Aviso>{error}</Aviso>

          {!resultado && !error && (
            <div className="rejilla">
              {Array.from({ length: 8 }, (_, i) => <TarjetaLibroEsqueleto key={i} />)}
            </div>
          )}

          {resultado && resultado.datos.length === 0 && !cargando && (
            <div className="vacio">
              <h3>Ningún libro coincide con estos filtros</h3>
              <p>Prueba con otra palabra, amplía el rango de precio o quita algún filtro.</p>
              <button type="button" className="boton boton--secundario" onClick={limpiar}>Ver todos los libros</button>
            </div>
          )}

          {resultado && resultado.datos.length > 0 && (
            <>
              <div className={`rejilla${cargando ? ' rejilla--actualizando' : ''}`}>
                {resultado.datos.map((libro) => <TarjetaLibro key={libro._id} libro={libro} />)}
              </div>
              <Paginacion
                pagina={resultado.paginacion.pagina}
                paginas={resultado.paginacion.paginas}
                onCambiar={cambiarPagina}
              />
            </>
          )}
        </section>
      </div>

      {filtrosAbiertos && <div className="velo" onClick={() => setFiltrosAbiertos(false)} aria-hidden="true" />}
    </>
  );
}
