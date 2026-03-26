import { Component, Input, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paginacion } from '../../../paginacion/paginacion';
import { MuseoArticuloService } from '../../../../services/museoArticulos/museo-articulo.service';
import { Articulo } from '../../../../interfaces/articulo.interface';
import { ArticulosMuseoToggle } from '../articulos-museo-toggle/articulos-museo-toggle';

@Component({
  selector: 'app-articulos-museo-table',
  standalone: true,
  imports: [CommonModule, Paginacion, ArticulosMuseoToggle],
  templateUrl: './articulos-museo-table.html',
})
export class ArticulosMuseoTable {
  
  private museoArticuloService = inject(MuseoArticuloService);

  // 🔹 Recibe museoId del padre
  @Input() museoId: number | null = null;

  // 🔹 Cuando cambie el museoId, configuramos el resource
  constructor() {
    effect(() => {
      if (!this.museoId) return;

      this.museoArticuloService.museoId.set(this.museoId);
      this.museoArticuloService.currentPage.set(1);
      this.museoArticuloService.recargarProductos();
    });
  }

  // 🔹 Datos reales del backend
  protected response = this.museoArticuloService.productos;

  protected articulos = computed<Articulo[]>(() =>
    this.response.value()?.data?.data ?? []
  );

  protected meta = computed(() =>
    this.response.value()?.data?.meta
  );

  // 🔹 Paginación independiente
  onPageChange(page: number) {
    this.museoArticuloService.currentPage.set(page);
  }

  toggleArticulo(articulo: Articulo) {

  if (!articulo.id) return;

  this.museoArticuloService
    .toggleArticuloMuseo(articulo.id)
    .subscribe({
      next: () => {

        this.museoArticuloService.recargarProductos();

      },
      error: (err) => {
        alert(err.error?.message ?? 'No se pudo actualizar el artículo');
      }
    });

}
}