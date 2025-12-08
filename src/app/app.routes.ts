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

import { FormularioRegistroVisitente } from './components/operador/formulario-registro-visitente/formulario-registro-visitente';
import { BoletosFormList } from './components/operador/boletos/boletos-form-list/boletos-form-list';
import { ProductosListOp } from './components/operador/productos/productos-list-op/productos-list-op';
import { AgendaOperador } from './components/operador/agenda/agenda';

import { BoletosFormulario } from './components/operador/boletos/boletos-formulario/boletos-formulario';
import { ProductosAdd } from './components/operador/productos/productos-add/productos-add';
import { BoletosAdd } from './components/operador/boletos/boletos-add/boletos-add';
import { ProductosVenta } from './components/operador/productos/productos-vendidios/productos-vendidos';
import { BoletosVenta } from './components/operador/boletos/boletos-venta/boletos-venta';
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
        component: ProductosVenta,
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









