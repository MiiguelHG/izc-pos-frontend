export const formatProcedencia = (pais: string, estado: string | null, municipio: string | null): string => {
  const partes = [pais, estado, municipio].filter(parte => parte && parte.trim() !== '');
  return partes.length > 0 ? partes.join(', ') : 'Procedencia no especificada';
}