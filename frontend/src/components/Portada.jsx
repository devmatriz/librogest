import { encuadernacion, nombresAutores } from '../utils/encuadernacion';

// Si el libro no tiene imagen, se dibuja una tapa de tela con el título estampado
export default function Portada({ libro, grande = false }) {
  const clase = `portada${grande ? ' portada--grande' : ''}`;
  if (libro.portadaUrl) {
    return <img className={clase} src={libro.portadaUrl} alt={`Portada de ${libro.titulo}`} />;
  }
  const { tela, tinta } = encuadernacion(libro.titulo);
  return (
    <div className={`${clase} portada--tela`} style={{ '--tela': tela, '--tinta-tela': tinta }} aria-hidden="true">
      <div className="portada__marco">
        <span className="portada__titulo">{libro.titulo}</span>
        <span className="portada__filete" />
        <span className="portada__autor">{nombresAutores(libro)}</span>
      </div>
    </div>
  );
}
