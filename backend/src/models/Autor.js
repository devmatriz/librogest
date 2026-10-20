import { Schema, model } from 'mongoose';

const autorSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    nacionalidad: { type: String, trim: true },
    biografia: { type: String },
  },
  { timestamps: true }
);

export default model('Autor', autorSchema, 'autores');
