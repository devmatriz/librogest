import mongoose from 'mongoose';

export async function conectarDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Falta la variable MONGO_URI en .env');

  await mongoose.connect(uri);
  console.log(`MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
