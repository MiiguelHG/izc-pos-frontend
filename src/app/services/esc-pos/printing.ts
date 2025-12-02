import { Injectable } from '@angular/core';
//Obtener hora y fecha actual
import { formatDate } from '@angular/common';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';

import { PrecioTotal, boletosselect, nivelErrorQR, NivelCorreccionQR } from '../../components/operador/boletos/boletos-form-list/boletos-form-list';
import { nombreVisitante, ExportFechaEmision, ExportTotalVisitantes } from '../../components/operador/form-visit/form-visit';


interface DatosTicket {
  nombre: string;
  totalVisitantes: number;
  precio: string;
  fechaHora: string;
  lugar: string;
  boletosSeleccionados: string;
}

interface DatosQR {
  totalVisitantes: number;
  boletos: string;
  precioTotal: string;
  'fecha-expiracion': string;
}


@Injectable({
  providedIn: 'root',
})
export class Printing {

  constructor() { }

  //Obtener hora y fecha actual
  private obtenerFechaActual(): string {
    const ahora = new Date();
    return formatDate(ahora, 'dd/MM/yyyy HH:mm:ss', 'es-MX');
  }

  //Obtener datos para el ticket
  private obtenerDatosTicket(): DatosTicket | null {
    const nombre = nombreVisitante;
    const totalVisitantes = ExportTotalVisitantes;
    const precio = PrecioTotal.toFixed(2);
    const fechaHora = this.obtenerFechaActual();
    const lugar = 'Zacatecas, México';
    const boletosSeleccionados: string = boletosselect;

    if (!nombre || !totalVisitantes || !precio) {
      console.error('Faltan datos para generar el ticket');
      alert('Faltan datos para generar el ticket');
      return null;
    }

    return {
      fechaHora,
      lugar,
      nombre,
      totalVisitantes,
      precio,
      boletosSeleccionados
    };
  }

  // Genera los datos para el código QR
  private generarDatosQR(datosTicket: DatosTicket): DatosQR {
    const fechaExpiracion = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    return {
      totalVisitantes: datosTicket.totalVisitantes,
      boletos: datosTicket.boletosSeleccionados,
      precioTotal: datosTicket.precio,
      'fecha-expiracion': fechaExpiracion.toLocaleString('es-MX')
    };
  }

  //Generar el código QR como Data URL
  private async generarCodigoQR(datosQR: DatosQR): Promise<string> {
    const datosQRString = JSON.stringify(datosQR);
    try {
      const
        qrCodeDataURL = await QRCode.toDataURL(datosQRString, {
          errorCorrectionLevel: nivelErrorQR,
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
  //Obtener descripción del nivel de correcciones de errores
  private obtenerDescripcionECC(nivel: string): string {
    const descripciones: { [key: string]: string } = {
      'L': 'Bajo (~7% de recuperación)',
      'M': 'Medio (~15% de recuperación)',
      'Q': 'Alto (~25% de recuperación)',
      'H': 'Muy Alto (~30% de recuperación)'
    };
    return descripciones[nivel] || 'Desconocido';
  }

  private async generarHTMLTicket(datosTicket: DatosTicket): Promise<string> {
    const DatosQR = this.generarDatosQR(datosTicket);
    const datosQRString = await this.generarCodigoQR(DatosQR);
    const descripcionECC = this.obtenerDescripcionECC(nivelErrorQR);

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
            size: 80mm auto;
            margin: 0;
          }

          @media print {
            body {
              width: 80mm;
              margin: 0;
              padding: 0;
            }
          }

          .qr-image {
            image-rendering: crisp-edges;
            image-rendering: pixelated;
          }
        </style>
      </head>
      <body class="w-[80mm] max-w-[80mm] mx-auto py-[5mm] px-[3mm] font-mono text-[11px] leading-relaxed text-black bg-white">
        <div class="w-full max-w-[74mm]">

          <!-- ENCABEZADO -->
          <div class="text-center w-full">
            <div class="text-[20px] font-bold tracking-[2px] mb-[3mm] uppercase">MUSEO</div>
            <div class="text-[12px] mb-[2mm]">${datosTicket.lugar}</div>
            <div class="text-[10px] mb-[3mm]">${datosTicket.fechaHora}</div>
          </div>
          
          <div class="border-t border-dashed border-black my-[3mm] w-full"></div>
          
          <!-- INFORMACIÓN DEL VISITANTE -->
          <div class="text-center w-full">
            <div class="font-bold text-[12px] mb-[2mm]">BIENVENIDO(A)</div>
            <div class="text-[14px] font-bold mb-[3mm]">${datosTicket.nombre}</div>
          </div>
          
          <div class="border-t border-dashed border-black my-[3mm] w-full"></div>
          
          <!-- DETALLES -->
          <div class="text-left w-full">
            <div class="mb-[2mm] text-[11px]">
              <strong>Total visitantes:</strong> ${datosTicket.totalVisitantes}
            </div>
            
            <div class="font-bold text-[12px] mb-[2mm] mt-[3mm]">BOLETOS:</div>
            <div class="ml-[3mm] mb-[3mm] text-[10px] leading-[1.6]">
              ${this.formatearBoletos(datosTicket.boletosSeleccionados)}
            </div>
          </div>
          
          <div class="border-t-2 border-solid border-black my-[3mm] w-full"></div>
          
          <!-- TOTAL -->
          <div class="text-center mt-[4mm] pt-[3mm]">
            <div class="text-[13px] font-bold mb-[1mm]">TOTAL A PAGAR</div>
            <div class="text-[18px] font-bold tracking-wide">$${datosTicket.precio} MXN</div>
          </div>
          
          <div class="border-t border-dashed border-black my-[3mm] w-full"></div>
          
          <!-- CÓDIGO QR -->
          <div class="text-center w-full">
            <div class="font-bold text-[12px] mb-[2mm]">CÓDIGO DE VALIDACIÓN</div>
            <div class="my-[5mm] flex justify-center items-center">
              ${datosQRString
              ? `<img src="${datosQRString}" alt="QR Code" class="w-[50mm] h-[50mm] qr-image">`
              : '<div class="w-[50mm] h-[50mm] border border-gray-300 flex items-center justify-center">QR no disponible</div>'
            }
            </div>
            <div class="text-[8px] mt-[2mm] text-gray-700">
              Nivel de corrección: ${nivelErrorQR} - ${descripcionECC}
            </div>
          </div>
          
          <div class="border-t border-dashed border-black my-[3mm] w-full"></div>
          
          <!-- PIE DE PÁGINA -->
          <div class="text-center mt-[5mm] pt-[3mm] text-[9px] italic">
            ¡Gracias por su visita!<br>
            Conserve su ticket para el acceso<br>
            Válido por 2 días
          </div>
          
          <!-- Espaciado final -->
          <div class="h-[5mm]"></div>
          
        </div>
      </body>
      </html>
    `;
  }

  // Formatear lista de boletos para mejor visualización
  private formatearBoletos(boletos: string): string {
    const boletosArray = boletos.split(',').map(b => b.trim()).filter(b => b);
    return boletosArray.map(boleto => `• ${boleto}`).join('<br>');
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
  public async imprimirTicket(): Promise<void> {
    const datosTicket = this.obtenerDatosTicket();
    if (!datosTicket) {
      console.error('No se pudieron obtener los datos del ticket');
      return;
    }

    const html = await this.generarHTMLTicket(datosTicket);
    this.imprimirHTML(html);

    console.log('Ticket con QR enviado a impresión', {
      datosTicket,
      nivelECC: nivelErrorQR
    });
  }

  // Vista previa del ticket
  public async vistaPrevia(): Promise<void> {
    const datosTicket = this.obtenerDatosTicket();
    if (!datosTicket) {
      console.error('No se pudieron obtener los datos del ticket');
      return;
    }

    const html = await this.generarHTMLTicket(datosTicket);
    const ventana = window.open('', '_blank', 'width=400,height=700');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  }

}