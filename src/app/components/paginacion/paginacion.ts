import { Component, computed, input, output } from '@angular/core';
import { Meta } from '../../interfaces/metadata.interface';

@Component({
  selector: 'app-paginacion',
  imports: [],
  standalone: true,
  templateUrl: './paginacion.html',
  styleUrls: ['./paginacion.css'],
})
export class Paginacion {
  readonly metaData = input<Meta>();
  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const totalPages = this.metaData()?.totalPages ?? 0;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  });

  readonly limitDataShowing = computed(() => {
    const md = this.metaData();
    if (!md) return 0;
    const totalItems = md.totalItems ?? 0;
    const pageSize = md.pageSize ?? 0;
    const currentPage = md.currentPage ?? 0;
    return totalItems > pageSize * currentPage ? currentPage * pageSize : totalItems;
  });

  readonly startDataShowing = computed(() => {
    const md = this.metaData();
    if (!md) return 0;
    const totalItems = md.totalItems ?? 0;
    const pageSize = md.pageSize ?? 0;
    const currentPage = md.currentPage ?? 0;
    return totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  });

  onPageClick(page: number, event: Event) {
    event.preventDefault();
    this.pageChange.emit(page);
  }

  onPreviousClick(event: Event) {
    event.preventDefault();
    const currentPage = this.metaData()?.currentPage ?? 1;
    if (currentPage > 1) {
      this.pageChange.emit(currentPage - 1);
    }
  }

  onNextClick(event: Event) {
    event.preventDefault();
    const currentPage = this.metaData()?.currentPage ?? 1;
    const totalPages = this.metaData()?.totalPages ?? 1;
    if (currentPage < totalPages) {
      this.pageChange.emit(currentPage + 1);
    }
  }
}