import 'dotenv/config';
import mongoose from 'mongoose';
import { conectarDB } from '../config/db.js';
import Autor from '../models/Autor.js';
import Categoria from '../models/Categoria.js';
import Libro from '../models/Libro.js';
import Usuario from '../models/Usuario.js';
import Pedido from '../models/Pedido.js';

async function seed() {
  await conectarDB();

  await Promise.all([
    Autor.deleteMany(),
    Categoria.deleteMany(),
    Libro.deleteMany(),
    Usuario.deleteMany(),
    Pedido.deleteMany(),
  ]);

  const [novela, fantasia, ciencia, infantil] = await Categoria.insertMany([
    { nombre: 'Novela', slug: 'novela' },
    { nombre: 'Fantasía', slug: 'fantasia' },
    { nombre: 'Ciencia', slug: 'ciencia' },
    { nombre: 'Infantil', slug: 'infantil' },
  ]);

  const [garcia, allende, tolkien, hawking, saintEx] = await Autor.insertMany([
    { nombre: 'Gabriel García Márquez', nacionalidad: 'Colombiana' },
    { nombre: 'Isabel Allende', nacionalidad: 'Chilena' },
    { nombre: 'J. R. R. Tolkien', nacionalidad: 'Británica' },
    { nombre: 'Stephen Hawking', nacionalidad: 'Británica' },
    { nombre: 'Antoine de Saint-Exupéry', nacionalidad: 'Francesa' },
  ]);

  const [admin, cliente] = await Usuario.create([
    { nombre: 'Administrador', email: 'admin@librogest.com', password: 'admin123', rol: 'admin' },
    {
      nombre: 'Cliente Demo',
      email: 'cliente@librogest.com',
      password: 'cliente123',
      direccion: { calle: 'Av. Principal 123', ciudad: 'Lima', cp: '15001' },
    },
  ]);

  const libros = await Libro.insertMany([
    {
      titulo: 'Cien años de soledad',
      isbn: '9780307474728',
      autores: [garcia._id],
      categoria: novela._id,
      editorial: 'Sudamericana',
      anioPublicacion: 1967,
      precio: 19.9,
      stock: 12,
      descripcion: 'La historia de la familia Buendía en el pueblo de Macondo.',
      valoraciones: [{ usuario: cliente._id, puntuacion: 5, comentario: 'Una obra maestra.' }],
    },
    {
      titulo: 'El amor en los tiempos del cólera',
      isbn: '9780307387264',
      autores: [garcia._id],
      categoria: novela._id,
      editorial: 'Oveja Negra',
      anioPublicacion: 1985,
      precio: 17.5,
      stock: 8,
      descripcion: 'Una historia de amor que espera más de cincuenta años.',
    },
    {
      titulo: 'La casa de los espíritus',
      isbn: '9788401352836',
      autores: [allende._id],
      categoria: novela._id,
      editorial: 'Plaza & Janés',
      anioPublicacion: 1982,
      precio: 18.0,
      stock: 5,
      descripcion: 'La saga de la familia Trueba a lo largo de cuatro generaciones.',
    },
    {
      titulo: 'El Hobbit',
      isbn: '9788445071403',
      autores: [tolkien._id],
      categoria: fantasia._id,
      editorial: 'Minotauro',
      anioPublicacion: 1937,
      precio: 15.95,
      stock: 20,
      descripcion: 'Bilbo Bolsón emprende una aventura junto a trece enanos.',
    },
    {
      titulo: 'El Señor de los Anillos: La Comunidad del Anillo',
      isbn: '9788445073728',
      autores: [tolkien._id],
      categoria: fantasia._id,
      editorial: 'Minotauro',
      anioPublicacion: 1954,
      precio: 22.5,
      stock: 10,
      descripcion: 'Frodo inicia el viaje para destruir el Anillo Único.',
    },
    {
      titulo: 'Breve historia del tiempo',
      isbn: '9788498920765',
      autores: [hawking._id],
      categoria: ciencia._id,
      editorial: 'Crítica',
      anioPublicacion: 1988,
      precio: 16.9,
      stock: 7,
      descripcion: 'Del Big Bang a los agujeros negros, explicado para todos.',
    },
    {
      titulo: 'El Principito',
      isbn: '9788478887194',
      autores: [saintEx._id],
      categoria: infantil._id,
      editorial: 'Salamandra',
      anioPublicacion: 1943,
      precio: 9.95,
      stock: 30,
      descripcion: 'Un pequeño príncipe viaja de planeta en planeta.',
    },
  ]);

  const [cien, , , hobbit] = libros;
  await Pedido.create({
    usuario: cliente._id,
    items: [
      { libro: cien._id, titulo: cien.titulo, precioUnitario: cien.precio, cantidad: 1 },
      { libro: hobbit._id, titulo: hobbit.titulo, precioUnitario: hobbit.precio, cantidad: 2 },
    ],
    total: cien.precio + hobbit.precio * 2,
    estado: 'pagado',
    direccionEnvio: cliente.direccion,
  });

  // Garantiza que los índices (únicos y de texto) existan en la base de datos
  await Promise.all([Categoria, Libro, Usuario, Pedido].map((m) => m.syncIndexes()));

  console.log('Datos de prueba insertados:');
  console.log(`  ${await Categoria.countDocuments()} categorías`);
  console.log(`  ${await Autor.countDocuments()} autores`);
  console.log(`  ${await Libro.countDocuments()} libros`);
  console.log(`  ${await Usuario.countDocuments()} usuarios (admin: ${admin.email} / admin123)`);
  console.log(`  ${await Pedido.countDocuments()} pedidos`);
}

try {
  await seed();
} catch (err) {
  console.error('Error en el seed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
