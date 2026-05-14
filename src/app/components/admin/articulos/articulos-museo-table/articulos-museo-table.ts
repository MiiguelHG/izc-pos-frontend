import { ChangeDetectionStrategy, Component, Input, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Paginacion } from '../../../paginacion/paginacion';
import { MuseoArticuloService } from '../../../../services/museoArticulos/museo-articulo.service';
import { Articulo } from '../../../../interfaces/articulo.interface';
import { ArticulosMuseoToggle } from '../articulos-museo-toggle/articulos-museo-toggle';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-articulos-museo-table',
  standalone: true,
  imports: [CommonModule, Paginacion, ArticulosMuseoToggle, DecimalPipe],
  templateUrl: './articulos-museo-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticulosMuseoTable {
  
  private museoArticuloService = inject(MuseoArticuloService);
  private toast = inject(ToastService);

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
      next: (res) => {
        this.toast.showSuccess(res.message || 'Artículo actualizado correctamente');
        this.museoArticuloService.recargarProductos();

      },
      error: (err) => {
        this.toast.showError(err.error?.message ?? 'No se pudo actualizar el artículo');
      }
    });

}
}