import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Meta } from '../../interfaces/metadata.interface';

@Component({
  selector: 'app-paginacion',
  imports: [],
  templateUrl: './paginacion.html',
  styleUrls: ['./paginacion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paginacion {
  readonly metaData = input<Meta>();
  readonly pageChange = output<number>();

  readonly pages = computed<(number | '...')[]>(() => {
    const totalPages = this.metaData()?.totalPages ?? 0;
    const currentPage = this.metaData()?.currentPage ?? 1;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
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

  onPageClick(page: number | '...', event: Event) {
    if (page === '...') return;
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