import { Injectable, signal } from '@angular/core';
export type NivelCorreccionQR = 'L' | 'M' | 'Q' | 'H';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionQRService {
  private readonly nivelErrorQROption = signal<NivelCorreccionQR>('M');
  readonly nivelError = this.nivelErrorQROption.asReadonly();

  setactualizarNivelErrorQR(nivel: NivelCorreccionQR):void {
    this.nivelErrorQROption.set(nivel);
  }

  resetearNivelErrorQR():void {
    this.nivelErrorQROption.set('M');
  }

  //obtener el nivel de error del qr
getDescripcionNivelErrorQR(nivel?: NivelCorreccionQR): string {
  const nivelActual = nivel || this.nivelError();
  const descripciones:Record<NivelCorreccionQR, string> = {
    'L': 'L Bajo (~7% de recuperación)',
    'M': 'M Medio (~15% de recuperación)',
    'Q': 'Q Alto (~25% de recuperación)',
    'H': 'H Muy Alto (~30% de recuperación)'
  };
  return descripciones[nivelActual] || 'M';
  }
}
  


