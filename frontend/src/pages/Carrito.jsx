import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MAX_POR_LIBRO, useCarrito } from '../context/CarritoContext';
import { formatearPrecio } from '../config';
import { nombresAutores } from '../utils/encuadernacion';
import Portada from '../components/Portada';
import SelectorCantidad from '../components/SelectorCantidad';
import Aviso from '../components/Aviso';

export default function Carrito() {
  const { items, unidades, total, cambiarCantidad, quitar, refrescar } = useCarrito();
  const [cambios, setCambios] = useState([]);
  const refrescado = useRef(false);

  // Al abrir el carrito se comprueban precio y stock actuales (una vez)
  useEffect(() => {
    if (refrescado.current || items.length === 0) return;
    refrescado.current = true;
    const ids = items.map((i) => i.libro._id).join(',');
    api.get(`/libros?ids=${ids}&limit=50`).then(({ data }) => {
      const porId = new Map(data.datos.map((l) => [l._id, l]));
      const avisos = [];
      for (const { libro, cantidad } of items) {
        const actual = porId.get(libro._id);
        if (!actual) avisos.push(`«${libro.titulo}» ya no está en el catálogo y se quitó del carrito.`);
        else if (actual.stock === 0) avisos.push(`«${libro.titulo}» se ha agotado.`);
        else if (actual.stock < cantidad) avisos.push(`De «${libro.titulo}» solo quedan ${actual.stock}; ajustamos la cantidad.`);
        else if (actual.precio !== libro.precio) avisos.push(`El precio de «${libro.titulo}» cambió a ${formatearPrecio(actual.precio)}.`);
      }
      setCambios(avisos);
      refrescar(data.datos);
    }).catch(() => {});
  }, [items, refrescar]);

  if (items.length === 0) {
    return (
      <div className="vacio">
        <h1>Tu carrito está vacío</h1>
        <p>Cuando añadas un libro desde su página, aparecerá aquí.</p>
        <Link to="/" className="boton boton--primario">Explorar el catálogo</Link>
      </div>
    );
  }

  const hayAgotados = items.some((i) => i.libro.stock === 0);

  return (
    <>
      <header className="cabecera">
        <h1>Tu carrito</h1>
        <p>{unidades === 1 ? '1 libro' : `${unidades} libros`}</p>
      </header>

      {cambios.length > 0 && (
        <Aviso tipo="info">
          <ul className="lista-avisos">{cambios.map((c) => <li key={c}>{c}</li>)}</ul>
        </Aviso>
      )}

      <div className="compra-layout">
        <ul className="lineas">
          {items.map(({ libro, cantidad }) => {
            const agotado = libro.stock === 0;
            return (
              <li key={libro._id} className={`linea${agotado ? ' linea--agotada' : ''}`}>
                <Link to={`/libros/${libro._id}`} className="linea__portada" tabIndex={-1} aria-hidden="true">
                  <Portada libro={libro} />
                </Link>
                <div className="linea__info">
                  <Link to={`/libros/${libro._id}`} className="linea__titulo">{libro.titulo}</Link>
                  <p className="linea__autor">{nombresAutores(libro)}</p>
                  <p className="linea__unitario">{formatearPrecio(libro.precio)} c/u</p>
                  {agotado && <p className="linea__aviso">Agotado. Quítalo para poder finalizar la compra.</p>}
                </div>
                <div className="linea__acciones">
                  {!agotado && (
                    <SelectorCantidad
                      valor={cantidad}
                      max={Math.min(MAX_POR_LIBRO, libro.stock)}
                      onCambiar={(n) => cambiarCantidad(libro._id, n)}
                      etiqueta={`Cantidad de ${libro.titulo}`}
                    />
                  )}
                  <button type="button" className="enlace enlace--peligro" onClick={() => quitar(libro._id)}>
                    Quitar
                  </button>
                </div>
                <p className="linea__subtotal precio">{agotado ? '—' : formatearPrecio(libro.precio * cantidad)}</p>
              </li>
            );
          })}
        </ul>

        <aside className="resumen-compra" aria-label="Resumen">
          <h2>Resumen</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatearPrecio(total)}</dd></div>
            <div><dt>Envío</dt><dd>Gratis</dd></div>
            <div className="resumen-compra__total"><dt>Total</dt><dd>{formatearPrecio(total)}</dd></div>
          </dl>
          {hayAgotados ? (
            <p className="nota">Quita los libros agotados para continuar.</p>
          ) : (
            <Link to="/finalizar" className="boton boton--primario resumen-compra__boton">Finalizar compra</Link>
          )}
          <Link to="/" className="resumen-compra__seguir">Seguir comprando</Link>
        </aside>
      </div>
    </>
  );
}
