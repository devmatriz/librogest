import Categoria from '../models/Categoria.js';
import Libro from '../models/Libro.js';
import { HttpError } from '../utils/httpError.js';
import { crearSlug } from '../utils/slug.js';

// Incluye cuántos libros tiene cada categoría (numLibros)
export async function listar(req, res) {
  const categorias = await Categoria.aggregate([
    {
      $lookup: {
        from: 'libros',
        localField: '_id',
        foreignField: 'categoria',
        pipeline: [{ $project: { _id: 1 } }],
        as: 'libros',
      },
    },
    { $addFields: { numLibros: { $size: '$libros' } } },
    { $project: { libros: 0, __v: 0 } },
    { $sort: { nombre: 1 } },
  ]);
  res.json(categorias);
}

export async function obtener(req, res) {
  const categoria = await Categoria.findById(req.params.id);
  if (!categoria) throw new HttpError(404, 'Categoría no encontrada');
  res.json(categoria);
}

export async function crear(req, res) {
  const { nombre } = req.body;
  const categoria = await Categoria.create({ nombre, slug: crearSlug(nombre ?? '') });
  res.status(201).json(categoria);
}

export async function actualizar(req, res) {
  const { nombre } = req.body;
  const cambios = nombre ? { nombre, slug: crearSlug(nombre) } : {};
  const categoria = await Categoria.findByIdAndUpdate(req.params.id, cambios, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!categoria) throw new HttpError(404, 'Categoría no encontrada');
  res.json(categoria);
}

export async function eliminar(req, res) {
  const enUso = await Libro.countDocuments({ categoria: req.params.id });
  if (enUso) throw new HttpError(409, `No se puede eliminar: ${enUso} libro(s) usan esta categoría`);

  const categoria = await Categoria.findByIdAndDelete(req.params.id);
  if (!categoria) throw new HttpError(404, 'Categoría no encontrada');
  res.status(204).end();
}
