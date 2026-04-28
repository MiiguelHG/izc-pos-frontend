import { effect, Injectable, signal } from '@angular/core';
import { Visitante } from '../../interfaces/visitante.interface';

interface VisitanteState {
  visitante: Visitante | null;
  invitadoId?: number | null;
  isGroup?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CurrentVentaBoletoService {
  state = signal<VisitanteState>(this.visitanteSaved());

  constructor() {
    effect(() => {
      const currentState = this.state();
      sessionStorage.setItem('currentVentaBoleto', JSON.stringify(currentState));
    });
  }
  
  private visitanteSaved (): VisitanteState {
    const savedState = sessionStorage.getItem('currentVentaBoleto');
    return savedState ? JSON.parse(savedState) : { visitante: null, invitadoId: null, isGroup: false };
  }

  clearState(): void {
    this.state.set({ visitante: null, invitadoId: null, isGroup: false });
    sessionStorage.removeItem('currentVentaBoleto');
  }
}
