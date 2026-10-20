import { Link } from 'react-router-dom';
import { encuadernacion, hashTexto, nombresAutores } from '../utils/encuadernacion';

// Cada lomo varía en alto y grosor de forma estable, como en una estantería real
function medidasLomo(libro) {
  const h = hashTexto(libro.isbn ?? libro.titulo);
  return {
    alto: 78 + (h % 5) * 5, // 78–98 % del estante
    grosor: Math.min(76, 44 + Math.round(libro.titulo.length * 0.7)), // px
  };
}

export default function Estanteria({ libros }) {
  if (!libros?.length) return null;
  return (
    <div className="estanteria">
      <ul className="estanteria__fila" aria-label="Libros mejor valorados">
        {libros.map((libro) => {
          const { tela, tinta } = encuadernacion(libro.titulo);
          const { alto, grosor } = medidasLomo(libro);
          return (
            <li
              key={libro._id}
              className="lomo"
              style={{ '--tela': tela, '--tinta-tela': tinta, '--alto': `${alto}%`, '--grosor': `${grosor}px` }}
            >
              <Link to={`/libros/${libro._id}`} aria-label={`${libro.titulo}, de ${nombresAutores(libro)}`}>
                <span className="lomo__titulo">{libro.titulo}</span>
                <span className="lomo__autor">{libro.autores?.[0]?.nombre.split(' ').at(-1)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="estanteria__tabla" aria-hidden="true" />
    </div>
  );
}
