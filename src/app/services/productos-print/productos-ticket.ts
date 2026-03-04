import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';

// import { PrecioTotal, prodcutosselect } from '../../components/operador/productos/productos-list-op/productos-list-op';

interface DatosTicket {
  fechaHora: string;
  lugar: string;
  productosSeleccionados: string;
  precio: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductosTicket {
  constructor() { }

  // Obtener hora y fecha actual
  private obtenerFechaActual(): string {
    const ahora = new Date();
    return formatDate(ahora, 'dd/MM/yyyy HH:mm:ss', 'es-MX');
  }

  // Obtener datos para el ticket
  // private obtenerDatosTicket(): DatosTicket | null {
  //   const fechaHora = this.obtenerFechaActual();
  //   const lugar = 'Zacatecas, México';
  //   const productosSeleccionados: string = prodcutosselect;
  //   const precio = PrecioTotal.toFixed(2);

  //   if (!productosSeleccionados || !precio) {
  //     console.error('Faltan datos para generar el ticket');
  //     alert('Faltan datos para generar el ticket');
  //     return null;
  //   }

  //   return {
  //     fechaHora,
  //     lugar,
  //     productosSeleccionados,
  //     precio
  //   };
  // }

  // Generar HTML optimizado para impresoras térmicas de 80mm
  private generarHTMLTicket(datosTicket: DatosTicket): string {
    return `
            <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          /* Configuración de página para 80mm */
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
          
          body {
            width: 80mm;
            max-width: 80mm;
            margin: 0 auto;
            font-family: 'Courier New', Courier, monospace;
          }
        </style>
      </head>
      <body class="bg-white text-black">
        <div class="w-full max-w-[74mm] py-5 px-3">
          
          <!-- ENCABEZADO -->
          <div class="text-center w-full">
            <div class="text-xl font-bold tracking-[0.2em] mb-3 uppercase">
              MUSEO
            </div>
            <div class="text-xs mb-2">
              ${datosTicket.lugar}
            </div>
            <div class="text-[10px] mb-3">
              ${datosTicket.fechaHora}
            </div>
          </div>
          
          <!-- SEPARADOR -->
          <div class="border-t border-dashed border-black my-3 w-full"></div>
          
          <!-- PRODUCTOS -->
          <div class="text-left w-full">
            <div class="font-bold text-xs mb-2">
              PRODUCTOS:
            </div>
            <div class="ml-2 mb-3 break-words text-xs leading-relaxed">
              ${datosTicket.productosSeleccionados}
            </div>
          </div>
          
          <!-- SEPARADOR GRUESO -->
          <div class="border-t-2 border-solid border-black my-3 w-full"></div>
          
          <!-- TOTAL -->
          <div class="text-center w-full mt-4 pt-3">
            <div class="text-sm font-bold mb-1">
              TOTAL A PAGAR
            </div>
            <div class="text-lg font-bold tracking-wide">
              $${datosTicket.precio} MXN
            </div>
          </div>
          
          <!-- SEPARADOR -->
          <div class="border-t border-dashed border-black my-3 w-full"></div>
          
          <!-- PIE DE PÁGINA -->
          <div class="text-center w-full mt-5 pt-3 text-[9px] italic">
            ¡Gracias por su visita!<br>
            Conserve su ticket
          </div>
          
          <!-- Espaciado final -->
          <div class="h-5"></div>
          
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
      }, 500); // Aumentado a 500ms para asegurar carga completa
    };
  }

  // imprimir ticket
  // public imprimirTicket(): void {
  //   const datosTicket = this.obtenerDatosTicket();
  //   if (!datosTicket) {
  //     console.error('No se pudieron obtener los datos del ticket');
  //     return;
  //   }

  //   const html = this.generarHTMLTicket(datosTicket);
  //   this.imprimirHTML(html);

  //   console.log('Ticket enviado a impresión', { datosTicket });
  // }

  // Vista previa del ticket 
  // public vistaPrevia(): void {
  //   const datosTicket = this.obtenerDatosTicket();
  //   if (!datosTicket) {
  //     console.error('No se pudieron obtener los datos del ticket');
  //     return;
  //   }

  //   const html = this.generarHTMLTicket(datosTicket);
  //   const ventana = window.open('', '_blank', 'width=400,height=600');
  //   if (ventana) {
  //     ventana.document.write(html);
  //     ventana.document.close();
  //   }
  // }
}
