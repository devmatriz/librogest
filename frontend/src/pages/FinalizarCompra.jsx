import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { mensajeError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { formatearPrecio } from '../config';
import Aviso from '../components/Aviso';

export default function FinalizarCompra() {
  const { usuario, setUsuario } = useAuth();
  const { items, unidades, total, vaciar } = useCarrito();
  const navigate = useNavigate();

  const sinDireccion = !usuario.direccion?.calle;
  const [direccion, setDireccion] = useState({
    calle: usuario.direccion?.calle ?? '',
    ciudad: usuario.direccion?.ciudad ?? '',
    cp: usuario.direccion?.cp ?? '',
  });
  const [guardar, setGuardar] = useState(sinDireccion);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (items.length === 0 && !enviando) return <Navigate to="/carrito" replace />;

  const cambiar = (campo) => (e) => setDireccion({ ...direccion, [campo]: e.target.value });

  async function confirmar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const { data: pedido } = await api.post('/pedidos', {
        items: items.map((i) => ({ libro: i.libro._id, cantidad: i.cantidad })),
        direccionEnvio: direccion,
      });
      if (guardar) {
        api.put('/auth/perfil', { direccion }).then(({ data }) => setUsuario(data)).catch(() => {});
      }
      vaciar();
      navigate(`/pedidos/${pedido._id}`, { replace: true, state: { nuevo: true } });
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  }

  return (
    <>
      <nav className="migas" aria-label="Ruta">
        <ol>
          <li><Link to="/carrito">Carrito</Link></li>
          <li aria-current="page">Finalizar compra</li>
        </ol>
      </nav>

      <header className="cabecera">
        <h1>Finalizar compra</h1>
      </header>

      <form className="compra-layout" onSubmit={confirmar}>
        <div className="pasos-compra">
          <section className="formulario">
            <h2>Dirección de envío</h2>
            <label>
              Nombre
              <input value={usuario.nombre} disabled />
            </label>
            <label>
              Calle y número
              <input autoComplete="street-address" required value={direccion.calle} onChange={cambiar('calle')} />
            </label>
            <div className="formulario__fila">
              <label>
                Ciudad
                <input autoComplete="address-level2" required value={direccion.ciudad} onChange={cambiar('ciudad')} />
              </label>
              <label>
                Código postal
                <input autoComplete="postal-code" required value={direccion.cp} onChange={cambiar('cp')} />
              </label>
            </div>
            <label className="casilla">
              <input type="checkbox" checked={guardar} onChange={(e) => setGuardar(e.target.checked)} />
              Guardar esta dirección en mi perfil
            </label>
          </section>

          <section className="pago">
            <h2>Pago</h2>
            <p>
              <strong>Transferencia bancaria.</strong> Al confirmar, te mostraremos los datos para pagar.
              Prepararemos tus libros en cuanto recibamos la transferencia.
            </p>
          </section>
        </div>

        <aside className="resumen-compra" aria-label="Resumen del pedido">
          <h2>Tu pedido</h2>
          <ul className="resumen-compra__lineas">
            {items.map(({ libro, cantidad }) => (
              <li key={libro._id}>
                <span>{libro.titulo} <span className="nota">× {cantidad}</span></span>
                <span className="precio">{formatearPrecio(libro.precio * cantidad)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div><dt>Subtotal ({unidades === 1 ? '1 libro' : `${unidades} libros`})</dt><dd>{formatearPrecio(total)}</dd></div>
            <div><dt>Envío</dt><dd>Gratis</dd></div>
            <div className="resumen-compra__total"><dt>Total</dt><dd>{formatearPrecio(total)}</dd></div>
          </dl>
          <Aviso>{error}</Aviso>
          {error && <Link to="/carrito" className="resumen-compra__seguir">Revisar el carrito</Link>}
          <button type="submit" className="boton boton--primario resumen-compra__boton" disabled={enviando}>
            {enviando ? 'Confirmando…' : 'Confirmar pedido'}
          </button>
        </aside>
      </form>
    </>
  );
}
