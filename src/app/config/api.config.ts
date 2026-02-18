export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api', // Cambia esto por tu URL base
  endpoints: {
    articulos: '/articulos',
    museoArticulos: '/museo-has-articulos',
    auth: '/auth',
    museos: '/museos',
    boletos: '/boletos',
    boletoTipos: '/boleto-tipos',
    boletosEmitidos: '/boletos-emitidos',
    productos: '/productos',
    productoVentas: '/producto-ventas',
    visitantes: '/visitantes',
    formaPago: '/formas-pago',
    dipomex: '/dipomex',
    usuarios:'/usuarios'
  }
} as const;
