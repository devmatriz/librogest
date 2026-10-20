export default function Cargando({ texto = 'Cargando' }) {
  return (
    <p className="cargando" role="status">
      <span className="cargando__punto" aria-hidden="true" />
      {texto}
    </p>
  );
}
