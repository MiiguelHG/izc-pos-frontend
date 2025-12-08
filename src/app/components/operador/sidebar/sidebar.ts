import { Component, ChangeDetectionStrategy, afterNextRender, inject, afterEveryRender, effect} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarOperador {
  protected readonly themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected user = this.authService.user;
  protected sessionLoading = this.authService.sessionLoading;

  constructor() {
    afterEveryRender(() => initFlowbite());

    effect(() => {
      const currentUser = this.user();
      const isLoading = this.sessionLoading();
      if (!isLoading && currentUser === null) {
        this.router.navigate(['/login']);
      }
    });

  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogOut(): void {
    this.authService.logOut();
  }
  
}
