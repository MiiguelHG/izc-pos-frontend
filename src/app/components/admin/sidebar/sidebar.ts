import { Component, ChangeDetectionStrategy, afterNextRender, inject, signal, effect, computed} from '@angular/core';
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
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  protected readonly isLoading = signal<boolean>(false);

  protected readonly username = computed(() => this.authService.userName());

  constructor() {
    afterNextRender(() => initFlowbite());

    effect(() => {
      if (!this.authService.isAutenticated() && this.isLoading()) {
        this.isLoading.update(() => false);
        this.router.navigate(['/login']);
      }
    })
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogOut(): void {
    this.isLoading.update(() => true);
    this.authService.logOut();
  }
}
