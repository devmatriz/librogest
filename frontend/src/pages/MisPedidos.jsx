import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { mensajeError } from '../services/api';
import { formatearPrecio } from '../config';
import { ESTADOS, contarLibros, formatoFechaPedido, numeroPedido } from '../utils/pedidos';
import Paginacion from '../components/Paginacion';
import Cargando from '../components/Cargando';
import Aviso from '../components/Aviso';

export default function MisPedidos() {
  const [params, setParams] = useSearchParams();
  const pagina = params.get('page') ?? '1';
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/pedidos/mios?page=${pagina}`)
      .then(({ data }) => setResultado(data))
      .catch((err) => setError(mensajeError(err)));
  }, [pagina]);

  if (error) return <Aviso>{error}</Aviso>;
  if (!resultado) return <Cargando texto="Cargando tus pedidos" />;

  if (resultado.paginacion.total === 0) {
    return (
      <div className="vacio">
        <h1>Aún no tienes pedidos</h1>
        <p>Cuando compres un libro, podrás seguir aquí su envío.</p>
        <Link to="/" className="boton boton--primario">Explorar el catálogo</Link>
      </div>
    );
  }

  return (
    <>
      <header className="cabecera">
        <h1>Mis pedidos</h1>
        <p>{resultado.paginacion.total === 1 ? '1 pedido' : `${resultado.paginacion.total} pedidos`}</p>
      </header>

      <ul className="pedidos">
        {resultado.datos.map((p) => (
          <li key={p._id}>
            <Link to={`/pedidos/${p._id}`} className="pedido-fila">
              <div className="pedido-fila__principal">
                <span className="pedido-fila__numero">Pedido {numeroPedido(p._id)}</span>
                <span className="pedido-fila__titulos">{p.items.map((i) => i.titulo).join(', ')}</span>
              </div>
              <time dateTime={p.createdAt}>{formatoFechaPedido.format(new Date(p.createdAt))}</time>
              <span className="pedido-fila__libros">{contarLibros(p)}</span>
              <span className="precio">{formatearPrecio(p.total)}</span>
              <span className={`estado estado--${p.estado}`}>{ESTADOS[p.estado].etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Paginacion
        pagina={resultado.paginacion.pagina}
        paginas={resultado.paginacion.paginas}
        onCambiar={(n) => setParams(n > 1 ? { page: String(n) } : {})}
      />
    </>
  );
}
