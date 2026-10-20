import Autor from '../models/Autor.js';
import Libro from '../models/Libro.js';
import { HttpError } from '../utils/httpError.js';

const CAMPOS = ['nombre', 'nacionalidad', 'biografia'];

function elegirCampos(body) {
  return Object.fromEntries(CAMPOS.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));
}

export async function listar(req, res) {
  const filtro = req.query.q ? { nombre: { $regex: req.query.q, $options: 'i' } } : {};
  const autores = await Autor.find(filtro).sort({ nombre: 1 });
  res.json(autores);
}

export async function obtener(req, res) {
  const autor = await Autor.findById(req.params.id);
  if (!autor) throw new HttpError(404, 'Autor no encontrado');

  const libros = await Libro.find({ autores: autor._id })
    .select('titulo precio portadaUrl anioPublicacion')
    .sort({ anioPublicacion: 1 });
  res.json({ ...autor.toJSON(), libros });
}

export async function crear(req, res) {
  const autor = await Autor.create(elegirCampos(req.body));
  res.status(201).json(autor);
}

export async function actualizar(req, res) {
  const autor = await Autor.findByIdAndUpdate(req.params.id, elegirCampos(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!autor) throw new HttpError(404, 'Autor no encontrado');
  res.json(autor);
}

export async function eliminar(req, res) {
  const enUso = await Libro.countDocuments({ autores: req.params.id });
  if (enUso) throw new HttpError(409, `No se puede eliminar: el autor tiene ${enUso} libro(s)`);

  const autor = await Autor.findByIdAndDelete(req.params.id);
  if (!autor) throw new HttpError(404, 'Autor no encontrado');
  res.status(204).end();
}
