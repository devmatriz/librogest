export function noEncontrado(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

function traducirErrorValidacion(e) {
  const { kind, path } = e;
  const { min, max, minlength, enumValues } = e.properties ?? {};
  switch (kind) {
    case 'required': return `${path} es obligatorio`;
    case 'min': return `${path} debe ser como mínimo ${min}`;
    case 'max': return `${path} debe ser como máximo ${max}`;
    case 'minlength': return `${path} debe tener al menos ${minlength} caracteres`;
    case 'regexp': return `${path} no tiene un formato válido`;
    case 'enum': return `${path} debe ser uno de: ${enumValues.join(', ')}`;
    default:
      return e.name === 'CastError' ? `${e.path} tiene un formato no válido` : `${path} no es válido`;
  }
}

// eslint-disable-next-line no-unused-vars
export function manejadorErrores(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const errores = Object.values(err.errors).map(traducirErrorValidacion);
    return res.status(400).json({ mensaje: 'Datos no válidos', errores });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ mensaje: `Valor no válido para ${err.path}: ${err.value}` });
  }
  if (err.code === 11000) {
    return res.status(409).json({ mensaje: `Ya existe un registro con ${JSON.stringify(err.keyValue)}` });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ mensaje: status === 500 ? 'Error interno del servidor' : err.message });
}
