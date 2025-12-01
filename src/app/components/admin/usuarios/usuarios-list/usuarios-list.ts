import { Component, signal } from '@angular/core';
import { UsuariosEdit } from '../usuarios-edit/usuarios-edit';
import { UsuariosDelete } from '../usuarios-delete/usuarios-delete';
import { UsuariosCreate } from '../usuarios-create/usuarios-create';
import { Paginacion } from "../../../paginacion/paginacion";
import { initFlowbite } from 'flowbite';

interface Usuario {
  id: number;
  nombre: string;
  idNumerico: string;
  correo: string;
  activo: boolean;
}

@Component({
  selector: 'app-usuarios-list',
  imports: [UsuariosEdit, UsuariosDelete, UsuariosCreate, Paginacion],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})
export class UsuariosList {
  usuarios = signal<Usuario[]>([
    { id: 1, nombre: 'Usuario1', idNumerico: '1234560', correo: 'usuario1@gmail.com', activo: true },
    { id: 2, nombre: 'Usuario2', idNumerico: '1234561', correo: 'usuario2@hotmail.com', activo: true },
    { id: 3, nombre: 'Usuario3', idNumerico: '1234562', correo: 'usuario3@yahoo.com', activo: true },
    { id: 4, nombre: 'Usuario4', idNumerico: '1234563', correo: 'usuario4@cozcyt.com', activo: true },
  ]);

  ngAfterViewInit() {
    initFlowbite();
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
