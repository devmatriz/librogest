import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api, { mensajeError } from '../services/api';
import { DATOS_BANCO, formatearPrecio } from '../config';
import { ESTADOS, PASOS, contarLibros, formatoFechaPedido, numeroPedido } from '../utils/pedidos';
import Portada from '../components/Portada';
import Cargando from '../components/Cargando';
import Aviso from '../components/Aviso';

export default function DetallePedido() {
  const { id } = useParams();
  const location = useLocation();
  const esNuevo = location.state?.nuevo === true;
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    api.get(`/pedidos/${id}`)
      .then(({ data }) => setPedido(data))
      .catch((err) => setError(mensajeError(err)));
  }, [id]);

  async function cancelar() {
    if (!window.confirm('¿Cancelar este pedido? Los libros volverán a estar disponibles para otros lectores.')) return;
    setCancelando(true);
    setError('');
    try {
      const { data } = await api.post(`/pedidos/${id}/cancelar`);
      setPedido((p) => ({ ...p, estado: data.estado }));
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCancelando(false);
    }
  }

  if (error && !pedido) {
    return (
      <div className="vacio">
        <h1>No encontramos este pedido</h1>
        <p>{error}</p>
        <Link to="/pedidos" className="boton boton--primario">Ver mis pedidos</Link>
      </div>
    );
  }
  if (!pedido) return <Cargando texto="Cargando el pedido" />;

  const numero = numeroPedido(pedido._id);
  const pasoActual = PASOS.indexOf(pedido.estado);

  return (
    <>
      <nav className="migas" aria-label="Ruta">
        <ol>
          <li><Link to="/pedidos">Mis pedidos</Link></li>
          <li aria-current="page">Pedido {numero}</li>
        </ol>
      </nav>

      {esNuevo && pedido.estado === 'pendiente' && (
        <section className="confirmacion" aria-labelledby="titulo-confirmacion">
          <h1 id="titulo-confirmacion">¡Gracias! Hemos recibido tu pedido</h1>
          <p>
            Para completarlo, haz una transferencia de <strong>{formatearPrecio(pedido.total)}</strong> indicando
            el concepto <strong>Pedido {numero}</strong>. Te avisaremos cuando la recibamos.
          </p>
          <dl className="datos-banco">
            <div><dt>Titular</dt><dd>{DATOS_BANCO.titular}</dd></div>
            <div><dt>Cuenta</dt><dd>{DATOS_BANCO.cuenta}</dd></div>
            <div><dt>Concepto</dt><dd>Pedido {numero}</dd></div>
          </dl>
        </section>
      )}

      <header className="cabecera pedido-cabecera">
        <div>
          {esNuevo ? <h2>Pedido {numero}</h2> : <h1>Pedido {numero}</h1>}
          <p>Realizado el {formatoFechaPedido.format(new Date(pedido.createdAt))}</p>
        </div>
        <span className={`estado estado--${pedido.estado}`}>{ESTADOS[pedido.estado].etiqueta}</span>
      </header>

      {pedido.estado === 'cancelado' ? (
        <Aviso tipo="info">{ESTADOS.cancelado.detalle}</Aviso>
      ) : (
        <ol className="seguimiento" aria-label="Seguimiento del pedido">
          {PASOS.map((paso, i) => (
            <li
              key={paso}
              className={i < pasoActual ? 'hecho' : i === pasoActual ? 'actual' : undefined}
              aria-current={i === pasoActual ? 'step' : undefined}
            >
              <span className="seguimiento__marca" aria-hidden="true" />
              <span className="seguimiento__texto">
                <strong>{ESTADOS[paso].etiqueta}</strong>
                {i === pasoActual && <span>{ESTADOS[paso].detalle}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="compra-layout">
        <section aria-labelledby="titulo-libros">
          <h2 id="titulo-libros" className="sr-only">Libros del pedido</h2>
          <ul className="lineas">
            {pedido.items.map((item) => {
              // Si el libro se retiró del catálogo, se muestra con los datos guardados en el pedido
              const libro = item.libro ?? null;
              const datosPortada = { titulo: item.titulo, autores: libro?.autores, portadaUrl: libro?.portadaUrl };
              return (
                <li key={item.libro?._id ?? item.titulo} className="linea">
                  <div className="linea__portada" aria-hidden="true"><Portada libro={datosPortada} /></div>
                  <div className="linea__info">
                    {libro
                      ? <Link to={`/libros/${libro._id}`} className="linea__titulo">{item.titulo}</Link>
                      : <span className="linea__titulo">{item.titulo}</span>}
                    {libro?.autores && <p className="linea__autor">{libro.autores.map((a) => a.nombre).join(', ')}</p>}
                    <p className="linea__unitario">{item.cantidad} × {formatearPrecio(item.precioUnitario)}</p>
                  </div>
                  <p className="linea__subtotal precio">{formatearPrecio(item.precioUnitario * item.cantidad)}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="resumen-compra" aria-label="Resumen del pedido">
          <h2>Resumen</h2>
          <dl>
            <div><dt>Subtotal ({contarLibros(pedido)})</dt><dd>{formatearPrecio(pedido.total)}</dd></div>
            <div><dt>Envío</dt><dd>Gratis</dd></div>
            <div className="resumen-compra__total"><dt>Total</dt><dd>{formatearPrecio(pedido.total)}</dd></div>
          </dl>
          <h3>Dirección de envío</h3>
          <address>
            {pedido.usuario?.nombre}<br />
            {pedido.direccionEnvio.calle}<br />
            {pedido.direccionEnvio.cp} {pedido.direccionEnvio.ciudad}
          </address>
          <Aviso>{error}</Aviso>
          {pedido.estado === 'pendiente' && (
            <button type="button" className="boton boton--secundario resumen-compra__boton" onClick={cancelar} disabled={cancelando}>
              {cancelando ? 'Cancelando…' : 'Cancelar pedido'}
            </button>
          )}
        </aside>
      </div>
    </>
  );
}
