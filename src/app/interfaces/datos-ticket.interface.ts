
export interface DatosTicket {
    museoUsuario: string;
    museoUbicacion: string;
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
