import { Component, ChangeDetectionStrategy, inject, effect, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Footer } from '../../footer/footer';
import { LayoutHeader } from '../../shared/layout-header/layout-header';

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Footer, LayoutHeader],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  protected user = this.authService.user;
  protected sessionLoading = signal<boolean>(false);
  protected isSidebarOpen = signal(false);
  protected isBoletosDropdownOpen = signal(false);
  protected isUserDropdownOpen = signal(false);

  constructor() {

    effect(() => {
      const currentUser = this.user();
      
      if (currentUser === null) {
        this.sessionLoading.set(false);
        this.router.navigate(['/login']);
      }
    })
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogOut(): void {
    this.authService.logOut();
    this.sessionLoading.set(true); // Indica que estamos en proceso de cierre de sesión
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((isOpen) => !isOpen);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  toggleBoletosDropdown(): void {
    this.isBoletosDropdownOpen.update((isOpen) => !isOpen);
    if (this.isUserDropdownOpen()) {
      this.isUserDropdownOpen.set(false);
    }
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.update((isOpen) => !isOpen);
    if (this.isBoletosDropdownOpen()) {
      this.isBoletosDropdownOpen.set(false);
    }
  }
}
