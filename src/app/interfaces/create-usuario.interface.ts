export interface CreateUsuario {
    nombre: string;
    email: string;
    password: string;
    rolId: number;
    museoId: number;
    activo?: boolean;
}
