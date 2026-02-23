import { Component, ChangeDetectionStrategy, inject, effect, signal} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
}
