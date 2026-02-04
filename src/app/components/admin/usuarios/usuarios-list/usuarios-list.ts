import { afterNextRender, Component, signal } from '@angular/core';
import { UsuariosEdit } from '../usuarios-edit/usuarios-edit';
import { UsuariosDelete } from '../usuarios-delete/usuarios-delete';
import { UsuariosCreate } from '../usuarios-create/usuarios-create';
import { initFlowbite } from 'flowbite';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  museo: string;
  activo: boolean;
}

@Component({
  selector: 'app-usuarios-list',
  imports: [UsuariosEdit, UsuariosDelete, UsuariosCreate],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})
export class UsuariosList {
  usuarios = signal<Usuario[]>([
    { id: 1, nombre: 'Usuario1', correo: 'usuario1@gmail.com', rol: 'Admin', museo: 'Museo1', activo: true },
    { id: 2, nombre: 'Usuario2', correo: 'usuario2@hotmail.com', rol: 'Director', museo: 'Museo2', activo: true },
    { id: 3, nombre: 'Usuario3', correo: 'usuario3@yahoo.com', rol: 'Operador', museo: 'Museo3', activo: false },
    { id: 4, nombre: 'Usuario4', correo: 'usuario4@cozcyt.com', rol: 'Admin', museo: 'Museo4', activo: true },
  ]);

  constructor() {
    afterNextRender(() => initFlowbite());
  }

  deleteUsuario(id: number) {
    this.usuarios.set(this.usuarios().filter(usuario => usuario.id !== id));
  }

  updateUsuario(updatedUsuario: Usuario) {
    this.usuarios.update(usuarios => 
      usuarios.map(usuario => 
        usuario.id === updatedUsuario.id ? updatedUsuario : usuario
      )
    );
  }

  createUsuario(newUsuarioData: Omit<Usuario, 'id'>) {
    const maxId = Math.max(...this.usuarios().map(u => u.id), 0);
    const newUsuario: Usuario = {
      id: maxId + 1,
      ...newUsuarioData
    };
    
    this.usuarios.update(usuarios => [...usuarios, newUsuario]);
  }
}
