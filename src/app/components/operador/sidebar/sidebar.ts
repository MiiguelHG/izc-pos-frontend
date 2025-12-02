/*
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  constructor(private router: Router) { }

  navegarEditarCrearProducto() {
    this.router.navigate(['/interfaz-editar-productos']);
  }
  navegarPaginacion() {
    this.router.navigate(['/paginacion']);
  }
}
*/
import { Component, ChangeDetectionStrategy, afterNextRender, inject} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarOperador {
  protected readonly themeService = inject(ThemeService);

  constructor() {
    afterNextRender(() => initFlowbite());
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

    // Esto se ejecuta cada vez que el componente se renderiza
  ngAfterViewInit() {
    initFlowbite(); // re-inicializa todos los modales, dropdowns, etc.
  }
}
