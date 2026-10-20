// Textos de cada estado tal como los ve el cliente
export const ESTADOS = {
  pendiente: { etiqueta: 'Pendiente de pago', detalle: 'Esperamos tu transferencia para preparar el pedido.' },
  pagado: { etiqueta: 'Pago confirmado', detalle: 'Estamos preparando tus libros.' },
  enviado: { etiqueta: 'Enviado', detalle: 'Tu pedido va de camino.' },
  entregado: { etiqueta: 'Entregado', detalle: 'Esperamos que disfrutes la lectura.' },
  cancelado: { etiqueta: 'Cancelado', detalle: 'Este pedido se canceló y no se cobrará.' },
};

export const PASOS = ['pendiente', 'pagado', 'enviado', 'entregado'];

// Número corto y legible a partir del identificador de MongoDB
export const numeroPedido = (id) => id.slice(-6).toUpperCase();

export const formatoFechaPedido = new Intl.DateTimeFormat('es', { dateStyle: 'long' });

export const contarLibros = (pedido) => {
  const n = pedido.items.reduce((s, i) => s + i.cantidad, 0);
  return n === 1 ? '1 libro' : `${n} libros`;
};
