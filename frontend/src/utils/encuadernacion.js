// Colores de tela de encuadernar: cada libro recibe siempre el mismo según su título
const TELAS = [
  { tela: '#1F4D45', tinta: '#E9DFC2' }, // verde botella
  { tela: '#6B2C2C', tinta: '#EBD9B4' }, // burdeos
  { tela: '#24365C', tinta: '#D9DEE8' }, // azul marino
  { tela: '#8C6A1E', tinta: '#F6EBCB' }, // ocre
  { tela: '#3F4C55', tinta: '#E4E8EA' }, // pizarra
  { tela: '#4A2D45', tinta: '#EADAE4' }, // ciruela
  { tela: '#2E5A4C', tinta: '#E3EBDC' }, // verde musgo
  { tela: '#5A3A22', tinta: '#EEDCC5' }, // cuero
];

export function hashTexto(texto = '') {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function encuadernacion(titulo) {
  return TELAS[hashTexto(titulo) % TELAS.length];
}

export const nombresAutores = (libro) => libro.autores?.map((a) => a.nombre).join(', ') ?? '';
