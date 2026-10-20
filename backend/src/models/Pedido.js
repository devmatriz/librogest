import { Schema, model } from 'mongoose';

const itemSchema = new Schema(
  {
    libro: { type: Schema.Types.ObjectId, ref: 'Libro', required: true },
    titulo: { type: String, required: true },
    precioUnitario: { type: Number, required: true, min: 0 },
    cantidad: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const pedidoSchema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'],
      default: 'pendiente',
    },
    direccionEnvio: {
      calle: String,
      ciudad: String,
      cp: String,
    },
  },
  { timestamps: true }
);

pedidoSchema.index({ usuario: 1, createdAt: -1 });

export default model('Pedido', pedidoSchema, 'pedidos');
