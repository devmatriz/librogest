import { Link } from 'react-router-dom';
import { formatearPrecio } from '../config';
import { nombresAutores } from '../utils/encuadernacion';
import Portada from './Portada';
import Estrellas from './Estrellas';

export default function TarjetaLibro({ libro }) {
  const agotado = libro.stock === 0;
  return (
    <article className={`libro${agotado ? ' libro--agotado' : ''}`}>
      <Link to={`/libros/${libro._id}`} className="libro__enlace">
        <Portada libro={libro} />
        <h3 className="libro__titulo">{libro.titulo}</h3>
      </Link>
      <p className="libro__autor">{nombresAutores(libro)}</p>
      <div className="libro__pie">
        <span className="precio">{formatearPrecio(libro.precio)}</span>
        {agotado ? (
          <span className="libro__estado">Agotado</span>
        ) : (
          libro.numValoraciones > 0 && <Estrellas valor={libro.valoracionMedia} compacto />
        )}
      </div>
    </article>
  );
}

export function TarjetaLibroEsqueleto() {
  return (
    <div className="libro libro--esqueleto" aria-hidden="true">
      <div className="portada esqueleto" />
      <div className="esqueleto esqueleto--linea" />
      <div className="esqueleto esqueleto--linea esqueleto--corta" />
    </div>
  );
}
