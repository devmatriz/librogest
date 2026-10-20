import mongoose from 'mongoose';
import Pedido from '../models/Pedido.js';
import Libro from '../models/Libro.js';
import { HttpError } from '../utils/httpError.js';
import { leerPaginacion, respuestaPaginada } from '../utils/paginacion.js';

const MAX_POR_LIBRO = 20;

// Cambios de estado permitidos (el admin los aplica en orden)
const TRANSICIONES = {
  pendiente: ['pagado', 'cancelado'],
  pagado: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
};

const redondear = (n) => Math.round(n * 100) / 100;

// Agrupa líneas repetidas y valida identificadores y cantidades
function normalizarItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'El pedido no tiene libros');
  }
  const cantidades = new Map();
  for (const item of items) {
    const id = String(item?.libro ?? '');
    const cantidad = Number(item?.cantidad);
    if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `Libro no válido: ${id}`);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new HttpError(400, 'La cantidad de cada libro debe ser un número entero mayor que 0');
    }
    cantidades.set(id, (cantidades.get(id) ?? 0) + cantidad);
  }
  for (const cantidad of cantidades.values()) {
    if (cantidad > MAX_POR_LIBRO) throw new HttpError(400, `Máximo ${MAX_POR_LIBRO} unidades por libro`);
  }
  return cantidades;
}

function validarDireccion(direccion) {
  const faltan = ['calle', 'ciudad', 'cp'].filter((c) => !String(direccion?.[c] ?? '').trim());
  if (faltan.length) throw new HttpError(400, `Falta completar la dirección de envío: ${faltan.join(', ')}`);
  return {
    calle: direccion.calle.trim(),
    ciudad: direccion.ciudad.trim(),
    cp: String(direccion.cp).trim(),
  };
}

async function devolverStock(items) {
  await Promise.all(
    items.map((i) => Libro.updateOne({ _id: i.libro }, { $inc: { stock: i.cantidad } }))
  );
}

/**
 * POST /api/pedidos
 * Body: { items: [{ libro, cantidad }], direccionEnvio?: { calle, ciudad, cp } }
 * Si no se envía dirección, se usa la del perfil.
 */
export async function crear(req, res) {
  const cantidades = normalizarItems(req.body.items);
  const direccionEnvio = validarDireccion(req.body.direccionEnvio ?? req.usuario.direccion);

  const libros = await Libro.find({ _id: { $in: [...cantidades.keys()] } }).select('titulo precio stock');
  if (libros.length !== cantidades.size) {
    throw new HttpError(400, 'Alguno de los libros ya no está disponible en el catálogo');
  }

  // Descuento atómico por libro: solo se aplica si hay stock suficiente.
  // Si algún libro falla, se devuelve el stock ya descontado de los anteriores.
  const descontados = [];
  for (const libro of libros) {
    const cantidad = cantidades.get(String(libro._id));
    const { modifiedCount } = await Libro.updateOne(
      { _id: libro._id, stock: { $gte: cantidad } },
      { $inc: { stock: -cantidad } }
    );
    if (!modifiedCount) {
      await devolverStock(descontados);
      const actual = await Libro.findById(libro._id).select('stock');
      throw new HttpError(
        409,
        actual?.stock
          ? `Solo quedan ${actual.stock} ejemplares de «${libro.titulo}»`
          : `«${libro.titulo}» se ha agotado`
      );
    }
    descontados.push({ libro: libro._id, cantidad });
  }

  // Los precios salen de la base de datos, nunca del cliente
  const items = libros.map((l) => ({
    libro: l._id,
    titulo: l.titulo,
    precioUnitario: l.precio,
    cantidad: cantidades.get(String(l._id)),
  }));
  const total = redondear(items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0));

  try {
    const pedido = await Pedido.create({ usuario: req.usuario._id, items, total, direccionEnvio });
    res.status(201).json(pedido);
  } catch (err) {
    await devolverStock(descontados);
    throw err;
  }
}

// GET /api/pedidos/mios
export async function misPedidos(req, res) {
  const paginacion = leerPaginacion(req.query, { limiteDefecto: 10 });
  const filtro = { usuario: req.usuario._id };
  const [datos, total] = await Promise.all([
    Pedido.find(filtro).sort({ createdAt: -1 }).skip(paginacion.saltar).limit(paginacion.limite),
    Pedido.countDocuments(filtro),
  ]);
  res.json(respuestaPaginada(datos, total, paginacion));
}

// GET /api/pedidos/:id — el dueño del pedido o un admin
export async function obtener(req, res) {
  const pedido = await Pedido.findById(req.params.id)
    .populate('usuario', 'nombre email')
    .populate({
      path: 'items.libro',
      select: 'portadaUrl autores',
      populate: { path: 'autores', select: 'nombre' },
    });
  if (!pedido) throw new HttpError(404, 'Pedido no encontrado');

  const esDueno = pedido.usuario?._id.equals(req.usuario._id);
  if (!esDueno && req.usuario.rol !== 'admin') throw new HttpError(404, 'Pedido no encontrado');
  res.json(pedido);
}

// POST /api/pedidos/:id/cancelar — el cliente puede cancelar mientras esté pendiente
export async function cancelar(req, res) {
  const pedido = await Pedido.findOneAndUpdate(
    { _id: req.params.id, usuario: req.usuario._id, estado: 'pendiente' },
    { estado: 'cancelado' },
    { returnDocument: 'after' }
  );
  if (!pedido) {
    const existe = await Pedido.findOne({ _id: req.params.id, usuario: req.usuario._id }).select('estado');
    if (!existe) throw new HttpError(404, 'Pedido no encontrado');
    throw new HttpError(409, `No se puede cancelar un pedido en estado «${existe.estado}»`);
  }
  await devolverStock(pedido.items);
  res.json(pedido);
}

// GET /api/pedidos — admin: todos los pedidos, filtrables por estado
export async function listar(req, res) {
  const paginacion = leerPaginacion(req.query, { limiteDefecto: 20 });
  const filtro = {};
  if (req.query.estado) filtro.estado = req.query.estado;
  const [datos, total] = await Promise.all([
    Pedido.find(filtro)
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 })
      .skip(paginacion.saltar)
      .limit(paginacion.limite),
    Pedido.countDocuments(filtro),
  ]);
  res.json(respuestaPaginada(datos, total, paginacion));
}

// PATCH /api/pedidos/:id/estado — admin: avanza o cancela el pedido
export async function cambiarEstado(req, res) {
  const { estado } = req.body;
  const actual = await Pedido.findById(req.params.id).select('estado');
  if (!actual) throw new HttpError(404, 'Pedido no encontrado');
  if (!TRANSICIONES[actual.estado]?.includes(estado)) {
    throw new HttpError(409, `No se puede pasar de «${actual.estado}» a «${estado}»`);
  }

  // La condición sobre el estado anterior evita aplicar dos cambios a la vez
  const pedido = await Pedido.findOneAndUpdate(
    { _id: req.params.id, estado: actual.estado },
    { estado },
    { returnDocument: 'after' }
  );
  if (!pedido) throw new HttpError(409, 'El pedido cambió mientras tanto; vuelve a intentarlo');
  if (estado === 'cancelado') await devolverStock(pedido.items);
  res.json(pedido);
}
