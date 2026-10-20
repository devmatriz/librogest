export function leerPaginacion(query, { limiteDefecto = 12, limiteMax = 50 } = {}) {
  const pagina = Math.max(1, parseInt(query.page, 10) || 1);
  const limite = Math.min(limiteMax, Math.max(1, parseInt(query.limit, 10) || limiteDefecto));
  return { pagina, limite, saltar: (pagina - 1) * limite };
}

export function respuestaPaginada(datos, total, { pagina, limite }) {
  return {
    datos,
    paginacion: { pagina, limite, total, paginas: Math.ceil(total / limite) || 1 },
  };
}
