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
        path: 'cortesias',
        loadComponent: () => import('./components/admin/cortesias/cortesia-list/cortesia-list').then(m => m.CortesiaList),
        title: 'Cortesias'
      },
      {
        path: 'servicios',
        component: ServiciosList,
        title: 'Servicios'
      },
      {
        path: 'informes',
        loadComponent: () => import('./components/admin/informes/formulario-base/formulario-base').then(m => m.FormularioBase),
        title: 'Informes'
      },
      {
        path: 'agenda',
        component: Agenda,
        title: 'Agenda'
      },
      {
        path: '',
        redirectTo: 'usuarios',
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
        redirectTo: 'productosventa',
        pathMatch: 'full'
      },
      {
        path: 'productosventa',
        loadComponent: () => import('./components/operador/productos/productos-vendidos/productos-vendidos').then(m => m.ProductosVenta),
        title: 'productos vendidos',
        children: [
          {
            path: 'listado-articulos',
            // component: ProductosListOp,
            loadComponent: () => import('./components/operador/productos/productos-ventas/productos-ventas').then(m => m.ProductosVentas),
            title: 'Listado de articulos'
          }
        ]

      },

      {
        path: 'registro-visitantes',
        loadComponent: () => import('./components/operador/formulario-registro-visitente/formulario-registro-visitente').then(m => m.FormularioRegistroVisitente),
        title: 'registro visitantes'
      },
      {
        path: 'boletos',
        loadComponent: () => import('./components/operador/boletos/boletos-vendidos/boletos-vendidos').then(m => m.BoletosVendidos),
        title: 'Boletos vendidos',
        children: [
          {
            path: 'registro',
            loadComponent: () => import('./components/operador/formulario-registro-visitente/formulario-registro-visitente').then(m => m.FormularioRegistroVisitente),
            title: 'Registro de visitante'
          },
          {
            path: 'venta',
            loadComponent: () => import('./components/operador/boletos/boletos-venta/boletos-venta').then(m => m.BoletosVenta),
            title: 'Venta de boletos'
          }
        ]
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









