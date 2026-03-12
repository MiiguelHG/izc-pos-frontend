export const  diasSemana = [
    { id: 0, nombre: 'D' },
    { id: 1, nombre: 'L' },
    { id: 2, nombre: 'M' },
    { id: 3, nombre: 'Mi' },
    { id: 4, nombre: 'J' },
    { id: 5, nombre: 'V' },
    { id: 6, nombre: 'S' },
  ];

export const formatDias = (dias: number[]): string => {
    const dayMap: { [key: number]: string } = {
      0: 'D',
      1: 'L',
      2: 'M',
      3: 'Mi',
      4: 'J',
      5: 'V',
      6: 'S'
    };
    return dias.map((day) => dayMap[day]).join(', ');
  }