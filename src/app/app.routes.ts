import { Routes } from '@angular/router';

import { Sidebar } from './components/admin/sidebar/sidebar';
import { SidebarOperador } from './components/operador/sidebar/sidebar';
import { Login } from './components/login/login';

export const routes: Routes = [

  {
    path: 'login',
    component: Login,
    title: 'IZC | Iniciar sesión'
  },

  {
    path: 'admin',
    component: Sidebar,
    title: 'IZC | Admin',
    children: [

      {
        path: 'usuarios',
        loadComponent: () => import('./components/admin/usuarios/usuarios-list/usuarios-list').then(m => m.UsuariosList),
        title: 'IZC | Usuarios'
      },
      {
        path: 'articulos',
        loadComponent: () => import('./components/admin/articulos/articulos-list/articulos-list').then(m => m.ArticulosList),
        title: 'IZC | Articulos'
      },
      {
        path: 'museos',
        loadComponent: () => import('./components/admin/museos/museos-list/museos-list').then(m => m.MuseosList),
        data: {
          page: 1
        },
        title: 'IZC | Museos'
      },
      {

        path: 'boletos',
        loadComponent: () => import('./components/admin/boletos/boletos-list/boletos-list').then(m => m.BoletosList),
        title: 'IZC | Boletos'
      },
      {
        path: 'cortesias',
        loadComponent: () => import('./components/admin/cortesias/cortesia-list/cortesia-list').then(m => m.CortesiaList),
        title: 'IZC | Cortesias'
      },
      {
        path: 'informes',
        loadComponent: () => import('./components/admin/informes/formulario-base/formulario-base').then(m => m.FormularioBase),
        title: 'IZC | Informes'
      },
      {
        path: 'agendar',
        loadComponent: () => import('./components/operador/agenda/agenda').then(m => m.AgendaOperador),
        title: 'IZC | Agendar',
        children: [
          {
            path: 'registro',
            loadComponent: () => import('./components/operador/formulario-registro-visitente/formulario-registro-visitente').then(m => m.FormularioRegistroVisitente),
            title: 'IZC | Registro de visitante'
          }
        ]
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
    title: 'IZC | Operador',

    children: [
      {
        path: '',
        redirectTo: 'boletos',
        pathMatch: 'full'
      },
      {
        path: 'productosventa',
        loadComponent: () => import('./components/operador/productos/productos-vendidos/productos-vendidos').then(m => m.ProductosVenta),
        title: 'IZC | Productos vendidos',
        children: [
          {
            path: 'listado-articulos',
            // component: ProductosListOp,
            loadComponent: () => import('./components/operador/productos/productos-ventas/productos-ventas').then(m => m.ProductosVentas),
            title: 'IZC | Listado de articulos'
          }
        ]

      },

      {
        path: 'registro-visitantes',
        loadComponent: () => import('./components/operador/formulario-registro-visitente/formulario-registro-visitente').then(m => m.FormularioRegistroVisitente),
        title: 'IZC | Registro de visitantes'
      },
      {
        path: 'boletos',
        loadComponent: () => import('./components/operador/boletos/boletos-vendidos/boletos-vendidos').then(m => m.BoletosVendidos),
        title: 'IZC | Boletos vendidos',
        children: [
          {
            path: 'registro',
            loadComponent: () => import('./components/operador/formulario-registro-visitente/formulario-registro-visitente').then(m => m.FormularioRegistroVisitente),
            title: 'IZC | Registro de visitante'
          },
          {
            path: 'venta',
            loadComponent: () => import('./components/operador/boletos/boletos-venta/boletos-venta').then(m => m.BoletosVenta),
            title: 'IZC | Venta de boletos'
          }
        ]
      },
      {
        path: 'agendar',
        loadComponent: () => import('./components/operador/agenda/agenda').then(m => m.AgendaOperador),
        title: 'IZC | Agendar',
        children: [
          {
            path: 'registro',
            loadComponent: () => import('./components/operador/formulario-registro-visitente/formulario-registro-visitente').then(m => m.FormularioRegistroVisitente),
            title: 'IZC | Registro de visitante'
          }
        ]
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









