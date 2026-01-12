import { Routes } from '@angular/router';

import { Sidebar } from './components/admin/sidebar/sidebar';
import { SidebarOperador } from './components/operador/sidebar/sidebar';
import { UsuariosList } from './components/admin/usuarios/usuarios-list/usuarios-list';
import { Login } from './components/login/login';

import { Paginacion } from './components/paginacion/paginacion';
import { ProductosList } from './components/admin/productos/productos-list/productos-list';

import { ServiciosList } from './components/admin/servicios/servicios-list/servicios-list';
import { FormularioBase } from './components/admin/informes/formulario-base/formulario-base';
import { Agenda } from './components/agenda/agenda';

import { AgendaOperador } from './components/operador/agenda/agenda';
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
        path: 'articulos',
        loadComponent: () => import('./components/admin/articulos/articulos-list/articulos-list').then(m => m.ArticulosList),
        title: 'Articulos'
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
        loadComponent: () => import('./components/admin/boletos/boletos-list/boletos-list').then(m => m.BoletosList),
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
        // component: ProductosListOp,
        loadComponent: () => import('./components/operador/productos/productos-ventas/productos-ventas').then(m => m.ProductosVentas),
        title: 'Productos'
      },
      {
        path: 'productosadd', // Probablemente se elimine este ruta en el futuro
        component: ProductosAdd,
        title: 'ProductosADD'
      },
      {
        path: 'productosventa',
        loadComponent: () =>
  import('./components/operador/productos/productos-vendidos/productos-vendidos')
    .then(m => m.ProductosVenta),

        title: 'productos vendidos'
      },
      {
        path: 'registro-visitantes',
        loadComponent: () => import('./components/operador/formulario-registro-visitente/formulario-registro-visitente').then(m => m.FormularioRegistroVisitente),
        title: 'registro visitantes'
      },
      {
        path: 'boletos',
        loadComponent: () => import('./components/operador/boletos/boletos-venta/boletos-venta').then(m => m.BoletosVenta),
        title: 'Boletos'
      },
      {
        path: 'boletos-vendidos',
        loadComponent: () => import('./components/operador/boletos/boletos-vendidos/boletos-vendidos').then(m => m.BoletosVendidos),
        title: 'Boletos vendidos'
      },
      {

        path: 'agendar',
        component: AgendaOperador,
        title: 'Agendar'

      },

    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login' // para rutas inexistentes
  }
];









