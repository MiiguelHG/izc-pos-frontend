import { Component, ChangeDetectionStrategy, inject, effect} from '@angular/core';
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
  protected sessionLoading = this.authService.sessionLoading;

  constructor() {

    effect(() => {
      const currentUser = this.user();
      const isLoading = this.sessionLoading();
      
      if (!isLoading && currentUser === null) {
        this.router.navigate(['/login']);
      }
    })
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogOut(): void {
    this.authService.logOut();
  }
}
