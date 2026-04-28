//printing.ts
import { inject, Injectable } from '@angular/core';
//Obtener hora y fecha actual
import { formatDate } from '@angular/common';
import * as QRCode from 'qrcode';
import { ConfiguracionQRService } from '../nivel-de-error-QR/configuracion-qr.service';
import { BoletoEmitidoInfo } from '../../interfaces/boleto-emitido-info.interface';
import { formatDireccion } from '../../helpers/index';

@Injectable({
  providedIn: 'root',
})
export class Printing {
  private ConfiguracionQR = inject(ConfiguracionQRService);
  constructor() { }

  //Obtener hora y fecha actual
  private obtenerFecha(fecha: string): string {
    return formatDate(fecha, 'dd/MM/yyyy HH:mm:ss', 'es-MX');
  }

  //Generar el código QR como Data URL
  private async generarCodigoQR(boletoEmitidoId: number): Promise<string> {
    const datosQRString = JSON.stringify(boletoEmitidoId);
    try {
      const
        qrCodeDataURL = await QRCode.toDataURL(datosQRString, {
          errorCorrectionLevel: this.ConfiguracionQR.nivelError(),
          width: 300, // Tamaño del QR en pixels
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generando código QR:', error);
      return '';
    }
  }

  private async generarHTMLTicket(boletoEmitido: BoletoEmitidoInfo, isGroup: boolean): Promise<string> {
    const datosQRString = await this.generarCodigoQR(boletoEmitido.id);
    const descripcionECC = this.ConfiguracionQR.getDescripcionNivelErrorQR();
    const nivelActual = this.ConfiguracionQR.nivelError();
    const fecaFormateada = this.obtenerFecha(boletoEmitido.fechaEmision);
    const ubicacionFormateada = formatDireccion(boletoEmitido.museo?.ubicacion);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket de Entrada</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            size: 72mm auto;
            margin: 0;
          }

          @media print {
            body {
              width: 72mm;
              margin: 0;
              padding: 0;
            }
          }
            
          *{
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .qr-image {
            image-rendering: crisp-edges;
            image-rendering: pixelated;
          }
        </style>
      </head>
      <body class="w-[72mm] max-w-[72mm] mx-auto py-[5mm] px-[3mm] font-mono text-[11px] leading-relaxed text-black bg-white">
        <div class="w-full max-w-[74mm]" style="page-break-inside: avoid;">

          <!-- ENCABEZADO -->
          <div class="text-center w-full">
            <div class="text-[18px] font-bold tracking-[2px] mb-[2mm] uppercase">${boletoEmitido.museo?.nombre}</div>
            <div class="text-[11px] mb-[2mm]">Emitido en: ${ubicacionFormateada}, Méx.</div>
            <div class="text-[10px] mb-[2mm]">${fecaFormateada}</div>
          </div>
          
          
          <!-- INFORMACIÓN DEL VISITANTE -->
          <div class="text-center w-full">
            <div class="font-bold text-[12px] mb-[0.5mm]">${isGroup ? 'Bienvenidos' : boletoEmitido.visitante.cantidadMujeres === 1 ? 'Bienvenida' : 'Bienvenido'}:</div>
            <div class="text-[14px] font-bold mb-[2mm]">${boletoEmitido.visitante?.nombre}</div>
          </div>
          

         <!-- CÓDIGO QR -->
        <div class="text-center w-full">
          <div class="mb-[2mm]" style="text-align:center;">
            ${datosQRString
              ? `<img src="${datosQRString}"
                      alt="QR Code"
                      class="qr-image"
                      style="width:45mm; height:45mm; display:block; margin:0 auto;">`
              : '<div style="width:45mm; height:45mm; border:1px solid #000; margin:0 auto;">QR no disponible</div>'
            }
          </div>
        </div>

          
          <!-- Espaciado final -->
          <div class="h-[5mm]"></div> 
          
        </div>
      </body>
      </html>
    `;
  }

  // Imprimir usando iframe
  private imprimirHTML(html: string): void {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      console.error('No se pudo acceder al documento del iframe para imprimir.');
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Configurar el evento de carga
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
        } catch (error) {
          console.error('Error al imprimir:', error);
        }

        // Limpiar después de imprimir
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 500);
    };
  }

  // Imprimir ticket 
  public async imprimirTicket(boletoEmitido: BoletoEmitidoInfo, isGroup: boolean): Promise<void> {
    if (!boletoEmitido) {
      console.error('No se pudieron obtener los datos del ticket');
      return;
    }

    const html = await this.generarHTMLTicket(boletoEmitido, isGroup);
    this.imprimirHTML(html);
  }

  // Vista previa del ticket
  public async vistaPrevia(boletoEmitido: BoletoEmitidoInfo, isGroup: boolean): Promise<void> {
    if (!boletoEmitido) {
      console.error('No se pudieron obtener los datos del ticket');
      return;
    }

    const html = await this.generarHTMLTicket(boletoEmitido, isGroup);
    const ventana = window.open('', '_blank', 'width=400,height=700');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  }

}