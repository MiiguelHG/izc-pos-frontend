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

import { FormVisit } from './components/operador/form-visit/form-visit';
import { BoletosFormList } from './components/operador/boletos/boletos-form-list/boletos-form-list';
import { ProductosListOp } from './components/operador/productos/productos-list-op/productos-list-op';
import { AgendaOperador } from './components/operador/agenda/agenda';

import { BoletosFormulario } from './components/operador/boletos/boletos-formulario/boletos-formulario';
import { ProductosAdd } from './components/operador/productos/productos-add/productos-add';
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
        loadComponent: () => import('./components/admin/museos/museos-list/museos-list').then(m => m.MuseosList),
        data: {
          page: 1
        },
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
        path: 'productos',
        component: ProductosListOp,
        title: 'Productos'
      },
      {
        path: 'productosadd',
        component: ProductosAdd,
        title: 'ProductosADD'
      },


      {
        path: 'servicios',
        component: ServiciosList,
        title: 'Servicios'
      },
      {
        path: 'visitantes',
        component: FormVisit,
        title: 'FormVisitantes'
      },
      {
        path: 'vistticket',
        component: BoletosFormulario,
        title: 'FormTicket'
      },
      {
        path: 'boletos',
        component: BoletosFormList,
        title: 'Boletos'
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









