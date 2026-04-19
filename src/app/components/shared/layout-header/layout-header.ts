import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../../services/auth/auth.service';

interface BreadcrumbItem {
  label: string;
  url: string;
  isCurrent: boolean;
}

@Component({
  selector: 'app-layout-header',
  imports: [RouterLink],
  templateUrl: './layout-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutHeader {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.user;
  protected readonly breadcrumbItems = signal<BreadcrumbItem[]>([]);

  protected readonly headerTitle = computed(() => {
    const currentUser = this.user();

    if (currentUser?.rol?.nombre === 'admin') {
      return 'Instituto Zacatecano de Cultura';
    }

    const museumName = currentUser?.museo?.nombre?.trim();
    if (museumName) {
      return museumName;
    }

    return 'Museo no asignado';
  });

  protected readonly roleLabel = computed(() => {
    const roleName = this.user()?.rol?.nombre;

    if (roleName === 'admin') {
      return 'Administrador';
    }

    if (roleName === 'operador') {
      return 'Operador';
    }

    if (roleName === 'directorMuseo') {
      return 'Director de museo';
    }

    return 'Usuario';
  });

  constructor() {
    this.updateBreadcrumbs();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  private updateBreadcrumbs(): void {
    const breadcrumbs = this.buildBreadcrumbs(this.router.routerState.snapshot.root);
    this.breadcrumbItems.set(breadcrumbs);
  }

  private buildBreadcrumbs(routeSnapshot: ActivatedRouteSnapshot): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    const urlSegments: string[] = [];

    let currentRoute: ActivatedRouteSnapshot | null = routeSnapshot;

    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;

      const segment = currentRoute.url.map((urlSegment) => urlSegment.path).join('/');
      if (segment.length > 0) {
        urlSegments.push(segment);
      }

      const label = this.resolveRouteLabel(currentRoute);
      if (label) {
        breadcrumbs.push({
          label,
          url: `/${urlSegments.join('/')}`,
          isCurrent: false,
        });
      }
    }

    if (breadcrumbs.length > 0) {
      const lastIndex = breadcrumbs.length - 1;
      breadcrumbs[lastIndex] = { ...breadcrumbs[lastIndex], isCurrent: true };
    }

    return breadcrumbs;
  }

  private resolveRouteLabel(routeSnapshot: ActivatedRouteSnapshot): string | null {
    const snapshotTitle = routeSnapshot.title;
    if (typeof snapshotTitle === 'string' && snapshotTitle.trim().length > 0) {
      return snapshotTitle;
    }

    const routeTitle = routeSnapshot.routeConfig?.title;
    if (typeof routeTitle === 'string' && routeTitle.trim().length > 0) {
      return routeTitle;
    }

    return null;
  }
}
