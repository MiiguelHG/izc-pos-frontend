export interface DatosTicket {
    nombreVisitante: string;
    totalVisitantes: number;
    boletos: {
        nombre: string;
        cantidad: number;
        precio: number;
        subtotal: number;
    }[];
    total: number;
    fecha: Date;
    usuarioNombre?: string;
}
