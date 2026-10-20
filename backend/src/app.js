import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import './models/index.js';
import { noEncontrado, manejadorErrores } from './middlewares/errores.js';
import authRoutes from './routes/auth.routes.js';
import librosRoutes from './routes/libros.routes.js';
import autoresRoutes from './routes/autores.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/salud', (req, res) => {
  const estados = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  res.json({ api: 'ok', mongo: estados[mongoose.connection.readyState] });
});

app.use('/api/auth', authRoutes);
app.use('/api/libros', librosRoutes);
app.use('/api/autores', autoresRoutes);
app.use('/api/categorias', categoriasRoutes);

app.use(noEncontrado);
app.use(manejadorErrores);

export default app;
