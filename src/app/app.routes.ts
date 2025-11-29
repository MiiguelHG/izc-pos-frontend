import { Routes } from '@angular/router';
import { Sidebar } from './components/admin/sidebar/sidebar';
import { SidebarOperador } from './components/operador/sidebar/sidebar';
import { UsuariosList } from './components/admin/usuarios/usuarios-list/usuarios-list';
import { Login } from './components/login/login';

import { Paginacion } from './components/paginacion/paginacion';
import { ProductosList } from './components/admin/productos/productos-list/productos-list';
import { MuseosList } from './components/admin/museos/museos-list/museos-list';
import { BoletosList } from './components/admin/boletos/boletos-list/boletos-list';

import { ServiciosList } from './components/admin/servicios/servicios-list/servicios-list';
import { FormularioBase } from './components/admin/informes/formulario-base/formulario-base';
import { Agenda } from './components/agenda/agenda';
import { AgendaOperador } from './components/operador/agenda/agenda';

export const routes: Routes = [

  {
    path: 'login',
    component: Login,
    title: 'Iniciar sesión'
  },

  {
    path: 'admin',
    component: Sidebar,
    title: 'Admin',
    children: [

      {
        path: 'usuarios',
        component: UsuariosList,
        title: 'Usuarios'
      },
      {
        path: '',
        redirectTo: 'usuarios',
        pathMatch: 'full'
      },
      {
        path: 'productos',
        component: ProductosList,
        title: 'Productos'
      },

      {
        path: 'paginacion',
        component: Paginacion,
        title: 'Paginacion'
      },
      {
        path: 'museos',
        component: MuseosList,
        title: 'Museos'
      },
      {

        path: 'boletos',
        component: BoletosList,
        title: 'Boletos'
      },
      {
        path: 'servicios',
        component: ServiciosList,
        title: 'Servicios'
      },
      {
        path: 'informes',
        component: FormularioBase,
        title: 'Informes'
      },
      {
        path: '',
        redirectTo: 'productos',
        pathMatch: 'full'
      },

      {
        path: 'agenda',
        component: Agenda,
        title: 'Agenda'
      },
      {
        path: '',
        redirectTo: 'agenda',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'operador',
    component: SidebarOperador,
    title: 'Operador',
    children: [
      {
        path: '',
        redirectTo: 'productos',
      pathMatch: 'full'
      },

      {

        path: 'agendar',
        component: AgendaOperador,
        title: 'Agendar'

      },
    ]
  },

  {
    path: '**',
    redirectTo: 'login' // para rutas inexistentes
  }
];



