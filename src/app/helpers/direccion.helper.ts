import { Ubicacion } from "../interfaces/ubicacion.interface";

export function formatDireccion(ubicacion?: Ubicacion): string {
    if (!ubicacion) {
      return '';
    }

    const encabezadoDireccion = [
      ubicacion.calle?.trim(),
      ubicacion.numero != null ? `No. ${ubicacion.numero}` : null,
    ]
      .filter((parte): parte is string => Boolean(parte && parte.trim()))
      .join(' ');

    const lugar = [ubicacion.colonia, ubicacion.ciudad, ubicacion.estado]
      .filter((parte): parte is string => Boolean(parte && parte.trim()))
      .join(', ');

    const codigoPostal = ubicacion.codigoPostal != null ? `CP ${ubicacion.codigoPostal}` : '';

    return [encabezadoDireccion, lugar, codigoPostal]
      .filter((parte): parte is string => Boolean(parte && parte.trim()))
      .join(', ');
  }