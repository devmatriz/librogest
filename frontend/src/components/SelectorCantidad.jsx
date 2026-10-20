export default function SelectorCantidad({ valor, min = 1, max, onCambiar, etiqueta = 'Cantidad' }) {
  return (
    <div className="cantidad" role="group" aria-label={etiqueta}>
      <button type="button" onClick={() => onCambiar(valor - 1)} disabled={valor <= min} aria-label="Quitar uno">
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8" /></svg>
      </button>
      <output aria-live="polite">{valor}</output>
      <button type="button" onClick={() => onCambiar(valor + 1)} disabled={valor >= max} aria-label="Añadir uno">
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6 2v8" /></svg>
      </button>
    </div>
  );
}
