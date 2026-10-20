import Usuario from '../models/Usuario.js';
import { generarToken } from '../middlewares/auth.js';
import { HttpError } from '../utils/httpError.js';

function respuestaSesion(usuario) {
  return { token: generarToken(usuario), usuario };
}

// POST /api/auth/register — siempre crea clientes; los admins se crean desde la base de datos
export async function registrar(req, res) {
  const { nombre, email, password, direccion } = req.body;
  const usuario = await Usuario.create({ nombre, email, password, direccion });
  res.status(201).json(respuestaSesion(usuario));
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email y contraseña son obligatorios');

  const usuario = await Usuario.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  // Mismo mensaje en ambos casos para no revelar qué emails están registrados
  if (!usuario || !(await usuario.compararPassword(password))) {
    throw new HttpError(401, 'Email o contraseña incorrectos');
  }
  res.json(respuestaSesion(usuario));
}

// GET /api/auth/perfil
export async function perfil(req, res) {
  res.json(req.usuario);
}

// PUT /api/auth/perfil — nombre, dirección y, opcionalmente, cambio de contraseña
export async function actualizarPerfil(req, res) {
  const { nombre, direccion, passwordActual, passwordNueva } = req.body;
  const usuario = await Usuario.findById(req.usuario._id).select('+password');

  if (nombre !== undefined) usuario.nombre = nombre;
  if (direccion !== undefined) usuario.direccion = direccion;

  if (passwordNueva !== undefined) {
    if (!passwordActual || !(await usuario.compararPassword(passwordActual))) {
      throw new HttpError(400, 'La contraseña actual no es correcta');
    }
    usuario.password = passwordNueva;
  }

  await usuario.save();
  res.json(usuario);
}
