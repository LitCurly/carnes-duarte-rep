import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import { Order } from '../models/order';
import { CartService } from './cart.service';
import { ToastrService } from 'ngx-toastr';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  constructor(
    private firestore: Firestore,
    private cartService: CartService,
    private toastr: ToastrService
  ) {
    // Merge vfs_fonts into pdfMake
    // @ts-ignore
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  async generatePDF(order: Order): Promise<Blob> {
    const documentDefinition = {
      content: [
        { text: 'Boleta de Compra', style: 'header' },
        { text: `Fecha de Emisión: ${this.formatDate(order.createdAt)} Hora: ${this.formatTime(order.createdAt)}`, style: 'subheader' },
        ...order.items.map((item, index) => ({
          stack: [
            { text: `Producto ${index + 1}:`, style: 'itemHeader' },
            { text: `Nombre: ${item.nombre}` },
            { text: `Tipo: ${item.tipo}` },
            { text: `Cantidad: ${item.cantidad}` },
            { text: `Precio por Kilo: ${item.precioPorKilo}` },
            { text: `Subtotal: ${item.subtotal}` },
            { text: ' ' } // Espacio entre items
          ]
        })),
        { text: `Total: ${order.total}`, style: 'total' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          marginBottom: 10
        },
        subheader: {
          fontSize: 14,
          marginBottom: 5
        },
        itemHeader: {
          fontSize: 12,
          bold: true,
          marginTop: 10
        },
        total: {
          fontSize: 14,
          bold: true,
          marginTop: 10
        }
      }
    };

    return new Promise<Blob>((resolve) => {
      pdfMake.createPdf(documentDefinition).getBlob((blob) => {
        resolve(blob);
      });
    });
  }

  async uploadBoleta(pdfBlob: Blob, orderId: string): Promise<string> {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`orders/${orderId}.pdf`);

    try {
      await fileRef.put(pdfBlob);
      console.log('PDF subido correctamente al Storage');
      const downloadURL = await fileRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error('Error uploading boleta:', error);
      throw error;
    }
  }

  async getBoletaURL(orderId: string): Promise<string> {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`orders/${orderId}.pdf`);
    try {
      const url = await fileRef.getDownloadURL();
      return url;
    } catch (error) {
      console.error('Error getting boleta URL:', error);
      throw error;
    }
  }

  async sendBoletaWhatsApp(phoneNumber: string, message: string, orderId: string): Promise<void> {
    try {
      // Obtener la orden por su ID
      const order = await this.cartService.getOrderById(orderId).toPromise();

      if (!order) {
        throw new Error('Order not found');
      }

      // Generar el PDF de la boleta
      const pdfBlob = await this.generatePDF(order);

      // Subir la boleta a Firebase Storage y obtener la URL de descarga
      const downloadURL = await this.uploadBoleta(pdfBlob, orderId);

      // Generar el mensaje con la URL de la boleta
      const encodedMessage = encodeURIComponent(`${message} ${downloadURL}`);

      // Generar la URL de WhatsApp
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      // Abrir la URL de WhatsApp en una nueva ventana
      window.open(whatsappUrl, '_blank');

      // Guardar la URL de la boleta en Firestore si es necesario
      await this.saveBoletaToFirestore(downloadURL);

      // Mostrar mensaje de éxito usando Toastr
      this.toastr.success('Boleta enviada por WhatsApp correctamente.');
    } catch (error) {
      console.error('Error sending boleta via WhatsApp:', error);
      this.toastr.error('Error al enviar la boleta por WhatsApp.');
      throw error;
    }
  }

  private async saveBoletaToFirestore(downloadURL: string): Promise<void> {
    const docRef = doc(this.firestore, 'boletas', 'boleta');
    await setDoc(docRef, { downloadURL });
  }

  private formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  private formatTime(date: any): string {
    return new Date(date).toLocaleTimeString();
  }
}
