import mongoose from 'mongoose';
import Libro from '../models/Libro.js';
import Autor from '../models/Autor.js';
import Categoria from '../models/Categoria.js';
import { HttpError } from '../utils/httpError.js';
import { leerPaginacion, respuestaPaginada } from '../utils/paginacion.js';

const CAMPOS = [
  'titulo', 'isbn', 'autores', 'categoria', 'editorial',
  'anioPublicacion', 'precio', 'stock', 'descripcion', 'portadaUrl',
];

const ORDENES = {
  recientes: { createdAt: -1 },
  titulo: { titulo: 1 },
  precio_asc: { precio: 1 },
  precio_desc: { precio: -1 },
  valoracion: { valoracionMedia: -1 },
};

function elegirCampos(body) {
  return Object.fromEntries(CAMPOS.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));
}

// Comprueba que los autores y la categoría referenciados existan
async function validarReferencias({ autores, categoria }) {
  if (autores !== undefined) {
    if (!Array.isArray(autores) || autores.length === 0) {
      throw new HttpError(400, 'Debe indicar al menos un autor');
    }
    if (!autores.every((id) => mongoose.isValidObjectId(id))) {
      throw new HttpError(400, 'Hay identificadores de autor no válidos');
    }
    const existentes = await Autor.countDocuments({ _id: { $in: autores } });
    if (existentes !== new Set(autores.map(String)).size) {
      throw new HttpError(400, 'Alguno de los autores no existe');
    }
  }
  if (categoria !== undefined) {
    if (!mongoose.isValidObjectId(categoria) || !(await Categoria.exists({ _id: categoria }))) {
      throw new HttpError(400, 'La categoría no existe');
    }
  }
}

// La categoría se puede filtrar por _id o por slug (?categoria=fantasia)
async function resolverCategoria(valor) {
  if (mongoose.isValidObjectId(valor)) return new mongoose.Types.ObjectId(String(valor));
  const categoria = await Categoria.findOne({ slug: valor }).select('_id');
  return categoria?._id ?? null;
}

/**
 * GET /api/libros
 * Query: q, categoria, autor, min, max, disponibles=true, orden, page, limit
 */
export async function listar(req, res) {
  const { q, categoria, autor, min, max, disponibles, orden } = req.query;
  const paginacion = leerPaginacion(req.query);
  const filtro = {};

  if (q) filtro.$text = { $search: q };

  if (categoria) {
    const idCategoria = await resolverCategoria(categoria);
    if (!idCategoria) return res.json(respuestaPaginada([], 0, paginacion));
    filtro.categoria = idCategoria;
  }

  if (autor) {
    if (!mongoose.isValidObjectId(autor)) throw new HttpError(400, 'Identificador de autor no válido');
    filtro.autores = new mongoose.Types.ObjectId(String(autor));
  }

  if (min !== undefined || max !== undefined) {
    filtro.precio = {};
    if (min !== undefined && !isNaN(min)) filtro.precio.$gte = Number(min);
    if (max !== undefined && !isNaN(max)) filtro.precio.$lte = Number(max);
  }

  if (disponibles === 'true') filtro.stock = { $gt: 0 };

  // Con búsqueda de texto, por defecto se ordena por relevancia
  const sort = ORDENES[orden] ?? (q ? { score: { $meta: 'textScore' } } : ORDENES.recientes);

  const [resultado] = await Libro.aggregate([
    { $match: filtro },
    {
      $addFields: {
        valoracionMedia: { $round: [{ $ifNull: [{ $avg: '$valoraciones.puntuacion' }, 0] }, 1] },
        numValoraciones: { $size: '$valoraciones' },
        ...(q && { score: { $meta: 'textScore' } }),
      },
    },
    { $project: { valoraciones: 0, descripcion: 0 } },
    {
      $facet: {
        datos: [
          { $sort: { ...sort, _id: 1 } },
          { $skip: paginacion.saltar },
          { $limit: paginacion.limite },
          {
            $lookup: {
              from: 'autores',
              localField: 'autores',
              foreignField: '_id',
              pipeline: [{ $project: { nombre: 1 } }],
              as: 'autores',
            },
          },
          {
            $lookup: {
              from: 'categorias',
              localField: 'categoria',
              foreignField: '_id',
              pipeline: [{ $project: { nombre: 1, slug: 1 } }],
              as: 'categoria',
            },
          },
          { $unwind: { path: '$categoria', preserveNullAndEmptyArrays: true } },
          { $project: { score: 0, __v: 0 } },
        ],
        total: [{ $count: 'n' }],
      },
    },
  ]);

  res.json(respuestaPaginada(resultado.datos, resultado.total[0]?.n ?? 0, paginacion));
}

// GET /api/libros/:id
export async function obtener(req, res) {
  const libro = await Libro.findById(req.params.id)
    .populate('autores', 'nombre nacionalidad')
    .populate('categoria', 'nombre slug')
    .populate('valoraciones.usuario', 'nombre');
  if (!libro) throw new HttpError(404, 'Libro no encontrado');

  const puntuaciones = libro.valoraciones.map((v) => v.puntuacion);
  const media = puntuaciones.length
    ? Math.round((puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length) * 10) / 10
    : 0;

  res.json({ ...libro.toJSON(), valoracionMedia: media, numValoraciones: puntuaciones.length });
}

// POST /api/libros
export async function crear(req, res) {
  const datos = elegirCampos(req.body);
  await validarReferencias({ autores: datos.autores ?? [], categoria: datos.categoria ?? null });
  const libro = await Libro.create(datos);
  res.status(201).json(libro);
}

// PUT /api/libros/:id
export async function actualizar(req, res) {
  const cambios = elegirCampos(req.body);
  await validarReferencias(cambios);

  const libro = await Libro.findByIdAndUpdate(req.params.id, cambios, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!libro) throw new HttpError(404, 'Libro no encontrado');
  res.json(libro);
}

// DELETE /api/libros/:id
// Los pedidos guardan una copia del título y del precio, así que el historial no se pierde
export async function eliminar(req, res) {
  const libro = await Libro.findByIdAndDelete(req.params.id);
  if (!libro) throw new HttpError(404, 'Libro no encontrado');
  res.status(204).end();
}
