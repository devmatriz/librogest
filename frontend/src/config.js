// Moneda y formato regional de los precios
export const MONEDA = 'USD';
export const LOCALE = 'es';

const formateador = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: MONEDA });
export const formatearPrecio = (valor) => formateador.format(valor);

// Datos que ve el cliente para pagar por transferencia (cámbialos por los reales)
export const DATOS_BANCO = {
  titular: 'LibroGest',
  cuenta: '0000 0000 00 0000000000',
};
