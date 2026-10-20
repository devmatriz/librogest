import { Link } from 'react-router-dom';

export default function NoEncontrado() {
  return (
    <div className="vacio">
      <h1>Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <Link to="/" className="boton boton--primario">Ir al catálogo</Link>
    </div>
  );
}
