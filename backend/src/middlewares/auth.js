import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { HttpError } from '../utils/httpError.js';

export function generarToken(usuario) {
  return jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Exige un token válido: "Authorization: Bearer <token>"
export async function proteger(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) throw new HttpError(401, 'Debe iniciar sesión');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'La sesión ha expirado' : 'Token no válido';
    throw new HttpError(401, mensaje);
  }

  // Se consulta el usuario para reflejar cambios de rol o cuentas eliminadas
  const usuario = await Usuario.findById(payload.id);
  if (!usuario) throw new HttpError(401, 'El usuario ya no existe');

  req.usuario = usuario;
  next();
}

export function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') throw new HttpError(403, 'Acceso reservado a administradores');
  next();
}
