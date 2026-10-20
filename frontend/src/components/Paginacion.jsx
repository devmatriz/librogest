// Muestra la primera, la última y las páginas cercanas a la actual, con "…" entre medias
function paginasVisibles(pagina, paginas) {
  const set = new Set([1, paginas, pagina - 1, pagina, pagina + 1]);
  const lista = [...set].filter((n) => n >= 1 && n <= paginas).sort((a, b) => a - b);
  const resultado = [];
  lista.forEach((n, i) => {
    if (i > 0 && n - lista[i - 1] > 1) resultado.push(`hueco-${n}`);
    resultado.push(n);
  });
  return resultado;
}

export default function Paginacion({ pagina, paginas, onCambiar }) {
  if (paginas <= 1) return null;

  return (
    <nav className="paginacion" aria-label="Paginación">
      <button type="button" className="boton boton--fantasma" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </button>
      <ol>
        {paginasVisibles(pagina, paginas).map((n) =>
          typeof n === 'string' ? (
            <li key={n} className="paginacion__hueco" aria-hidden="true">…</li>
          ) : (
            <li key={n}>
              <button
                type="button"
                aria-current={n === pagina ? 'page' : undefined}
                aria-label={`Página ${n}`}
                onClick={() => onCambiar(n)}
              >
                {n}
              </button>
            </li>
          )
        )}
      </ol>
      <button type="button" className="boton boton--fantasma" disabled={pagina >= paginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente
      </button>
    </nav>
  );
}
