// Moneda y formato regional de los precios
export const MONEDA = 'USD';
export const LOCALE = 'es';

const formateador = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: MONEDA });
export const formatearPrecio = (valor) => formateador.format(valor);
