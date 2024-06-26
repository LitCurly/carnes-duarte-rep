import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../../models/order';
import { CartService } from '../../services/cart.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {

  order: Order | undefined;
  orderId: string | null = null;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.cartService.getOrderById(this.orderId).subscribe(order => {
        this.order = order;
      });
    }
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  formatTime(date: any): string {
    return new Date(date).toLocaleTimeString();
  }

  async openPdf(): Promise<void> {
    if (!this.order) {
      console.error('No se encontró la orden para generar el PDF.');
      return;
    }

    this.loading = true; // Mostrar spinner

    const documentDefinition = {
      content: [
        { text: 'Boleta de Compra', style: 'header' },
        { text: `Fecha de Emisión: ${this.formatDate(this.order.createdAt)} Hora: ${this.formatTime(this.order.createdAt)}`, style: 'subheader' },
        { text: 'Detalles de la Orden', style: 'subheader' },
        this.buildTable(this.order.items),
        { text: `Total: ${this.order.total}`, style: 'total' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5] as [number, number, number, number]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        },
        total: {
          bold: true,
          fontSize: 14,
          margin: [0, 10, 0, 0] as [number, number, number, number]
        }
      }
    };

    try {
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

      // Convertir el PDF generado en un Blob
      const blob = await this.convertToBlob(pdfDocGenerator);

      if (blob) {
        // Guardar el Blob en Firebase Storage
        const fileName = `ordenId=${this.orderId}.pdf`;
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`orders/${fileName}`);

        await fileRef.put(blob);

        // Obtener la URL de descarga del archivo
        const downloadURL = await fileRef.getDownloadURL();

        // Construir el enlace de WhatsApp
        const whatsappLink = `https://wa.me/?text=Descarga%20tu%20boleta%20aquí:%20${encodeURIComponent(downloadURL)}`;

        // Abrir enlace de WhatsApp
        window.open(whatsappLink, '_blank');

        // Mostrar mensaje de éxito
        this.toastr.success('Boleta generada y enviada por WhatsApp correctamente.');

        this.loading = false; // Ocultar spinner
      }

    } catch (error) {
      console.error('Error al generar o subir el PDF:', error);
      this.toastr.error('Error al generar o subir el PDF. Por favor, inténtalo nuevamente.');
      this.loading = false; // Ocultar spinner en caso de error
    }
  }

  async convertToBlob(pdfDocGenerator: pdfMake.TCreatedPdf): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      try {
        pdfDocGenerator.getBuffer((buffer: ArrayBuffer) => {
          const blob = new Blob([buffer], { type: 'application/pdf' });
          resolve(blob);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  buildTable(data: any[]): any {
    return {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            { text: 'Nombre', style: 'tableHeader' },
            { text: 'Tipo', style: 'tableHeader' },
            { text: 'Cantidad', style: 'tableHeader' },
            { text: 'Precio por Kilo', style: 'tableHeader' }
          ],
          ...data.map(item => [item.nombre, item.tipo, item.cantidad, item.precioPorKilo])
        ]
      }
    };
  }
}
