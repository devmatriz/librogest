import { Schema, model } from 'mongoose';

const categoriaSchema = new Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export default model('Categoria', categoriaSchema, 'categorias');
