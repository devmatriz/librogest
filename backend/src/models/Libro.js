import { Schema, model } from 'mongoose';

const valoracionSchema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    puntuacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'fecha', updatedAt: false } }
);

const libroSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    autores: [{ type: Schema.Types.ObjectId, ref: 'Autor', required: true }],
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    editorial: { type: String, trim: true },
    anioPublicacion: { type: Number },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    descripcion: { type: String },
    portadaUrl: { type: String },
    valoraciones: [valoracionSchema],
  },
  { timestamps: true }
);

libroSchema.index({ titulo: 'text', descripcion: 'text' }, { default_language: 'spanish' });
libroSchema.index({ categoria: 1, precio: 1 });

export default model('Libro', libroSchema, 'libros');
