import { useState } from 'react';

// Panel lateral de filtros. Los valores viven en la URL; este componente solo los edita.
// El padre le pasa una key que cambia con la URL para reiniciar los campos de precio.
export default function Filtros({ valores, categorias, onCambiar }) {
  const [min, setMin] = useState(valores.min ?? '');
  const [max, setMax] = useState(valores.max ?? '');
  const totalLibros = categorias.reduce((s, c) => s + (c.numLibros ?? 0), 0);

  function aplicarPrecio(e) {
    e.preventDefault();
    if ((min ?? '') === (valores.min ?? '') && (max ?? '') === (valores.max ?? '')) return;
    onCambiar({ min, max });
  }

  return (
    <div className="filtros">
      <fieldset className="filtros__grupo">
        <legend>Categoría</legend>
        <ul className="filtros__categorias">
          <li>
            <button
              type="button"
              aria-pressed={!valores.categoria}
              onClick={() => onCambiar({ categoria: '' })}
            >
              <span>Todas</span><span className="filtros__cuenta">{totalLibros}</span>
            </button>
          </li>
          {categorias.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                aria-pressed={valores.categoria === c.slug}
                onClick={() => onCambiar({ categoria: c.slug })}
              >
                <span>{c.nombre}</span><span className="filtros__cuenta">{c.numLibros}</span>
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <form className="filtros__grupo" onSubmit={aplicarPrecio}>
        <fieldset>
          <legend>Precio</legend>
          <div className="filtros__precio">
            <label>
              <span className="sr-only">Precio mínimo</span>
              <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="Desde" value={min} onChange={(e) => setMin(e.target.value)} onBlur={aplicarPrecio} />
            </label>
            <label>
              <span className="sr-only">Precio máximo</span>
              <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="Hasta" value={max} onChange={(e) => setMax(e.target.value)} onBlur={aplicarPrecio} />
            </label>
          </div>
        </fieldset>
        <button type="submit" className="sr-only">Aplicar precio</button>
      </form>

      <label className="interruptor">
        <input
          type="checkbox"
          role="switch"
          checked={valores.disponibles === 'true'}
          onChange={(e) => onCambiar({ disponibles: e.target.checked ? 'true' : '' })}
        />
        <span className="interruptor__pista" aria-hidden="true" />
        Solo libros en stock
      </label>
    </div>
  );
}
