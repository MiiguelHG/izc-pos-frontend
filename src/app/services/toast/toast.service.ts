import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly typeSignal = signal<ToastType>('success');
  private readonly messageSignal = signal<string>('');
  private readonly visibleSignal = signal<boolean>(false);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly type = this.typeSignal.asReadonly();
  readonly message = this.messageSignal.asReadonly();
  readonly visible = this.visibleSignal.asReadonly();

  showSuccess(message: string, duration = 3500): void {
    this.show('success', message, duration);
  }

  showError(message: string, duration = 3500): void {
    this.show('error', message, duration);
  }

  hide(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    this.visibleSignal.set(false);
  }

  private show(type: ToastType, message: string, duration: number): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    this.typeSignal.set(type);
    this.messageSignal.set(message);
    this.visibleSignal.set(true);

    if (duration > 0) {
      this.hideTimer = setTimeout(() => this.hide(), duration);
    }
  }
}