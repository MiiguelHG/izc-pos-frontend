export interface User {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  rolId: number;
  museoId: number;
  createdAt: string;
  updatedAt: string;
  rol: Rol;
  museo: Museo;
}

interface Museo {
  id: number;
  nombre: string;
  ubicacion: string;
  createdAt: string;
  updatedAt: string;
}

interface Rol {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
}
