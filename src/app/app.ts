import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth/auth.service';
import { Toast } from './components/shared/toast/toast';
import { ToastService } from './services/toast/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})

export class App {
  protected readonly title = signal('izc-pos-frontend');
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  protected readonly toast = inject(ToastService);

  ngOnInit(): void {
    this.authService.initializeSession();
  }
}

