import mongoose from 'mongoose';

export function validarId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: `Identificador no válido: ${req.params.id}` });
  }
  next();
}
