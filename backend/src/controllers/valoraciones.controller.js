import Libro from '../models/Libro.js';
import { HttpError } from '../utils/httpError.js';

// POST /api/libros/:id/valoraciones — una valoración por usuario; si ya existe, se actualiza
export async function valorar(req, res) {
  const { puntuacion, comentario } = req.body;
  const libro = await Libro.findById(req.params.id);
  if (!libro) throw new HttpError(404, 'Libro no encontrado');

  const existente = libro.valoraciones.find((v) => v.usuario.equals(req.usuario._id));
  if (existente) {
    existente.puntuacion = puntuacion;
    existente.comentario = comentario;
  } else {
    libro.valoraciones.push({ usuario: req.usuario._id, puntuacion, comentario });
  }

  await libro.save();
  const valoracion = libro.valoraciones.find((v) => v.usuario.equals(req.usuario._id));
  res.status(existente ? 200 : 201).json(valoracion);
}

// DELETE /api/libros/:id/valoraciones/:valoracionId — el autor de la valoración o un admin
export async function eliminarValoracion(req, res) {
  const libro = await Libro.findById(req.params.id);
  if (!libro) throw new HttpError(404, 'Libro no encontrado');

  const valoracion = libro.valoraciones.id(req.params.valoracionId);
  if (!valoracion) throw new HttpError(404, 'Valoración no encontrada');

  const esAutor = valoracion.usuario.equals(req.usuario._id);
  if (!esAutor && req.usuario.rol !== 'admin') {
    throw new HttpError(403, 'Solo puede eliminar sus propias valoraciones');
  }

  valoracion.deleteOne();
  await libro.save();
  res.status(204).end();
}
