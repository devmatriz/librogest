// compacto: una sola estrella con la nota ("★ 4,5"), para listados
export default function Estrellas({ valor = 0, total, compacto = false }) {
  const nota = valor.toLocaleString('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  if (compacto) {
    return (
      <span className="estrellas estrellas--compacto" aria-label={`Valoración ${nota} de 5`}>
        <span aria-hidden="true">★</span> {nota}
      </span>
    );
  }

  const redondeado = Math.round(valor);
  return (
    <span className="estrellas" aria-label={`Valoración ${nota} de 5`}>
      <span aria-hidden="true">
        {'★'.repeat(redondeado)}
        <span className="estrellas__vacias">{'★'.repeat(5 - redondeado)}</span>
      </span>
      {total !== undefined && (
        <span className="estrellas__total">
          {total === 1 ? '1 valoración' : `${total} valoraciones`}
        </span>
      )}
    </span>
  );
}
