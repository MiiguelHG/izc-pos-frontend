import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  private readonly destroyRef = inject(DestroyRef);
  private hideAnimationTimer: ReturnType<typeof setTimeout> | null = null;

  readonly type = input<'success' | 'error'>('success');
  readonly message = input<string>('');
  readonly visible = input<boolean>(false);
  readonly closeToast = output<void>();
  protected readonly isRendered = signal(false);
  protected readonly isLeaving = signal(false);

  constructor() {
    effect(() => {
      const isVisible = this.visible();

      if (isVisible) {
        this.clearHideAnimationTimer();
        this.isRendered.set(true);
        this.isLeaving.set(false);
        return;
      }

      if (!this.isRendered()) {
        return;
      }

      this.isLeaving.set(true);
      this.hideAnimationTimer = setTimeout(() => {
        this.isLeaving.set(false);
        this.isRendered.set(false);
        this.clearHideAnimationTimer();
      }, 240);
    });

    this.destroyRef.onDestroy(() => this.clearHideAnimationTimer());
  }

  protected onClose(): void {
    this.closeToast.emit();
  }

  protected containerClasses(): string {
    const baseClasses = 'fixed top-24 right-4 z-50 inline-flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300';
    const typeClasses = this.type() === 'success'
      ? 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
      : 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
    const visibilityClasses = this.isLeaving() ? 'opacity-0 pointer-events-none animate-toast-fade-out' : 'opacity-100 animate-toast-fade-in';

    return `${baseClasses} ${typeClasses} ${visibilityClasses}`;
  }

  protected iconClasses(): string {
    return this.type() === 'success' ? 'w-5 h-5 text-green-600 dark:text-green-400' : 'w-5 h-5 text-red-600 dark:text-red-400';
  }

  private clearHideAnimationTimer(): void {
    if (!this.hideAnimationTimer) {
      return;
    }

    clearTimeout(this.hideAnimationTimer);
    this.hideAnimationTimer = null;
  }

}
