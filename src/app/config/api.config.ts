export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api', // Cambia esto por tu URL base
  endpoints: {
    articulos: '/articulos',
    auth: '/auth',
    museos: '/museos',
    boletos: '/boletos',
    boletoTipos: '/boleto-tipos',
    boletosEmitidos: '/boletos-emitidos',
    productos: '/productos',
    visitantes: '/visitantes',
    formaPago: '/formas-pago',
    dipomex: '/dipomex',
  }
} as const;
