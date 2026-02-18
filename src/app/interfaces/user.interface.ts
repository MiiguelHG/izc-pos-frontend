import { Museo } from "./museo.interface";
import { Rol } from "./rol.interface";

export interface User {
  id?: number;
  nombre: string;
  email: string;
  //password: string;
  activo: boolean;
  rolId: number;
  museoId: number;
  rol: Rol;
  museo: Museo;
}
