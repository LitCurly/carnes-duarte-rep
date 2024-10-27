import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../../models/order';
import { CartService } from '../../services/cart.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import { AuthService } from "../../services/auth-service.service"; // Importar firestore

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
  organization: any = {};
  userRut: string | undefined;
  nombre?: string | undefined;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.cartService.getOrderById(this.orderId).subscribe(order => {
        this.order = order;
        if (order) {
          this.loadOrganizationData();
        }
        this.isLoading = false;
      });
      this.loadUserRut();
    }
  }

  loadOrganizationData(): void {
    firebase.firestore().collection('organizaciones').doc('zB4puD5MYCekNH38PIVr').get()
      .then((doc) => {
        if (doc.exists) {
          this.organization = doc.data();
          console.log('Datos de la organización:', this.organization);
        } else {
          console.error('No se encontró el documento de la organización.');
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos de la organización:', error);
      });
  }

  loadUserRut(): void {
    this.authService.getUserObservable().subscribe(user => {
      if (user) {
        firebase.firestore().collection('users').doc(user.uid).get()
          .then((doc) => {
            if (doc.exists) {
              this.nombre = doc.data()?.['nombre'];
              this.apellido = doc.data()?.['apellido'];
              this.telefono = doc.data()?.['telefono'];
              this.direccion = doc.data()?.['direccion'];
              this.email = doc.data()?.['email'];
              this.userRut = doc.data()?.['rut'];
              console.log('RUT del usuario:', this.userRut);
            } else {

            }
          })
          .catch((error) => {
            console.error('Error al obtener el RUT del usuario:', error);
          });
      } else {
        console.error('Usuario no autenticado.');
      }
    });
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  formatTime(date: any): string {
    return new Date(date).toLocaleTimeString();
  }

  formatRutUserData(rut: string): string {
    if (!rut) return '';
    rut = rut.replace(/\D/g, '');
    const rutFormateado = `${rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${rut.slice(-1)}`;
    return rutFormateado;
  }

  formatRutUser(rut: string): string {
    if (!rut) return '';
    rut = rut.replace(/\D/g, '');
    const encryptedRut = rut.substring(0, 2) + '*****' + rut.substring(rut.length - 2);
    return encryptedRut;
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined) return ''; // Handle undefined case gracefully
    return '$ ' + value.toLocaleString('es-CL') + ' CLP';
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }



  async openPdf(): Promise<void> {
    if (!this.order) {
      console.error('No se encontró la orden para generar el PDF.');
      return;
    }

    const documentDefinition = {
      header: [
        {
          marginTop: 13,
          marginBottom: 30,
          marginLeft: 10,
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [

              ],
            ],
          },
        },
      ],
      content: [
        {
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: `${this.organization.nombre}`,
                  fontSize: 15,
                  bold: true,
                  color: '#090909',
                  alignment: 'center',
                },
              ],
            ],
          },
        },
        {
          marginBottom: 20,
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [],
            ],
          },
        },
        {
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'Detalle de pedido',
                  fontSize: 18,
                  bold: true,
                  color: '#ffffff',
                  fillColor: '#000000',
                  alignment: 'center',
                },
              ],
            ],
          },
        },
        {
          marginTop: 5,
          layout: 'noBorders',
          table: {
            widths: [150, '*', 100, '*'],
            body: [
              ['','', '',''],
              [
                {
                  text: 'Fecha de Emisión:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.formatDate(this.order.createdAt)}`,
                  style: 'tableValue',
                },
                {
                  text: 'Hora:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.formatTime(this.order.createdAt)}`,
                  style: 'tableValue',
                },
              ],
            ],
          },
        },
        {
          marginTop: 1,
          layout: 'noBorders',
          table: {
            widths: [150, '*'],
            body: [
              ['',''],
              [
                {
                  text: 'Cliente:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.nombre ? this.capitalizeFirstLetter(this.nombre) : 'N/A'} ${this.apellido ? this.capitalizeFirstLetter(this.apellido) : 'N/A'} `,
                  style: 'tableValue',
                },

              ],
            ],
          },
        },{
          marginTop: 5,
          layout: 'noBorders',
          table: {
            widths: [150, '*', 100, '*'],
            body: [
              ['','', '',''],
              [
                {
                  text: 'RUT Cliente:',
                  style: 'tableTitle',
                },
                {
                  text: `${(this.userRut ? this.formatRutUser(this.userRut) : 'N/A')}`,
                  style: 'tableValue',
                },
                {
                  text: 'Teléfono:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.telefono}`,
                  style: 'tableValue',
                },
              ],
            ],
          },
        },
        {
          marginTop: 1,
          layout: 'noBorders',
          table: {
            widths: [150, '*'],
            body: [
              ['',''],
              [
                {
                  text: 'Dirección:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.direccion ? this.capitalizeFirstLetter(this.direccion) : 'N/A'}`,
                  style: 'tableValue',
                },
              ],
            ],
          },
        },
        {
          marginTop: 1,
          layout: 'noBorders',
          table: {
            widths: [150, '*'],
            body: [
              ['',''],
              [
                {
                  text: 'Correo:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.email}`,
                  style: 'tableValue',
                },
              ],
            ],
          },
        },
        {
          marginTop: 15,
          marginBottom: 5,
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text:  'Detalle de la Orden',
                  fontSize: 15,
                  bold: true,
                  color: '#070707',
                  alignment: 'left',
                },
              ],
            ],
          },
        },

        this.buildTable(this.order.items),
        {
          text: `Total: ${this.formatCurrency(this.order.total ?? 0)}`, style: 'total'}
      ],
      footer: [
        {
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [

              ],
            ],
          },
        },
      ],
      styles: {
        tableHeader: {
          fontSize: 10,
          bold: true,
          color: '#fff',
          fillColor: '#b70505',
          alignment: 'center' as 'center',
        },
        tableTitle: {
          fontSize: 12,
          color: 'gray',
          bold: true,
          alignment: 'right' as 'right',
        },
        tableValue: {
          fontSize: 12,
          bold: true,
        },
        tableValue2: {
          fontSize: 12,
          bold: true,
          alignment: 'right' as 'right',
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
        const whatsappLink = `https://wa.me/56997189761?text=Descarga%20el%20%20comprobante%20aquí:%20${encodeURIComponent(downloadURL)}`;


        // Abrir enlace de WhatsApp
        window.open(whatsappLink, '_blank');

        // Mostrar mensaje de éxito
        this.toastr.success('Comprobante generadado y enviado por WhatsApp correctamente.');

        this.loading = false; // Ocultar spinner
      }

    } catch (error) {
      this.toastr.error('Error al generar o subir el PDF. Por favor, inténtalo nuevamente.');
      this.loading = false;
    }
  }

  async convertToBlob(pdfDocGenerator: pdfMake.TCreatedPdf): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      try {
        pdfDocGenerator.getBuffer((buffer: ArrayBuffer) => {
          const blob = new Blob([buffer], {type: 'application/pdf'});
          resolve(blob);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  buildTable(data: any[]): any {
    const tableBody = [
      [
        { text: 'Descripción Cantidad x Precio', style: 'tableHeader' },
        { text: 'Unidad de Medida', style: 'tableHeader' },
        { text: 'Valor', style: 'tableHeader'}
      ],
      ...data.map(item => [
        {
          text: `${item.nombre} de ${item.tipo} ${item.cantidad} x ${this.formatCurrency(item.precioPorKilo)}`,
        },
        { text: 'Kilogramos', alignment: 'left' },
        { text: this.formatCurrency(item.cantidad * item.precioPorKilo), alignment: 'center' }
      ])
    ];

    return {
      table: {
        headerRows: 1,
        widths: [260, 'auto', 150], // Ajustar los anchos de las columnas según sea necesario
        body: tableBody
      },
      layout: {
        fillColor: function (rowIndex: number) {
          return (rowIndex % 2 === 0) ? '#f0f0f0' : null; // Alternar colores de fondo de filas
        },
        hLineWidth: function (i: number, node: any) {
          return (i === 0 || i === node.table.body.length) ? 0 : 1; // Establecer el ancho de las líneas horizontales
        },
        hLineColor: function (i: number, node: any) {
          return '#666666'; // Color gris oscuro para las líneas horizontales
        },
        vLineWidth: function (i: number, node: any) {
          return 0; // Establecer el ancho de las líneas verticales como 0 para eliminarlas
        },
      },
      style: 'lightHorizontalLines'
    };
  }

  async openPdfEmail(): Promise<void> {
    if (!this.order) {
      console.error('No se encontró la orden para generar el PDF.');
      return;
    }

    const documentDefinition = {
      header: [
        {
          marginTop: 13,
          marginBottom: 30,
          marginLeft: 10,
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [

              ],
            ],
          },
        },
      ],
      content: [
        {
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: `${this.organization.nombre}`,
                  fontSize: 15,
                  bold: true,
                  color: '#090909',
                  alignment: 'center',
                },
              ],
            ],
          },
        },
        {
          marginBottom: 20,
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [],
            ],
          },
        },
        {
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'Detalle de pedido',
                  fontSize: 18,
                  bold: true,
                  color: '#ffffff',
                  fillColor: '#000000',
                  alignment: 'center',
                },
              ],
            ],
          },
        },
        {
          marginTop: 5,
          layout: 'noBorders',
          table: {
            widths: [150, '*', 100, '*'],
            body: [
              ['','', '',''],
              [
                {
                  text: 'Fecha de Emisión:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.formatDate(this.order.createdAt)}`,
                  style: 'tableValue',
                },
                {
                  text: 'Hora:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.formatTime(this.order.createdAt)}`,
                  style: 'tableValue',
                },
              ],
            ],
          },
        },
        {
          marginTop: 1,
          layout: 'noBorders',
          table: {
            widths: [150, '*'],
            body: [
              ['',''],
              [
                {
                  text: 'Cliente:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.nombre ? this.capitalizeFirstLetter(this.nombre) : 'N/A'} ${this.apellido ? this.capitalizeFirstLetter(this.apellido) : 'N/A'} `,
                  style: 'tableValue',
                },

              ],
            ],
          },
        },{
          marginTop: 5,
          layout: 'noBorders',
          table: {
            widths: [150, '*', 100, '*'],
            body: [
              ['','', '',''],
              [
                {
                  text: 'RUT Cliente:',
                  style: 'tableTitle',
                },
                {
                  text: `${(this.userRut ? this.formatRutUser(this.userRut) : 'N/A')}`,
                  style: 'tableValue',
                },
                {
                  text: 'Teléfono:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.telefono}`,
                  style: 'tableValue',
                },
              ],
            ],
          },
        },
        {
          marginTop: 1,
          layout: 'noBorders',
          table: {
            widths: [150, '*'],
            body: [
              ['',''],
              [
                {
                  text: 'Dirección:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.direccion ? this.capitalizeFirstLetter(this.direccion) : 'N/A'}`,
                  style: 'tableValue',
                },
              ],
            ],
          },
        },
        {
          marginTop: 1,
          layout: 'noBorders',
          table: {
            widths: [150, '*'],
            body: [
              ['',''],
              [
                {
                  text: 'Correo:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.email}`,
                  style: 'tableValue',
                },
              ],
            ],
          },
        },
        {
          marginTop: 15,
          marginBottom: 5,
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text:  'Detalle de la Orden',
                  fontSize: 15,
                  bold: true,
                  color: '#070707',
                  alignment: 'left',
                },
              ],
            ],
          },
        },

        this.buildTable(this.order.items),
        {
          text: `Total: ${this.formatCurrency(this.order.total ?? 0)}`, style: 'total'}
      ],
      footer: [
        {
          layout: 'noBorders',
          table: {
            widths: ['*'],
            body: [
              [

              ],
            ],
          },
        },
      ],
      styles: {
        tableHeader: {
          fontSize: 10,
          bold: true,
          color: '#fff',
          fillColor: '#b70505',
          alignment: 'center' as 'center',
        },
        tableTitle: {
          fontSize: 12,
          color: 'gray',
          bold: true,
          alignment: 'right' as 'right',
        },
        tableValue: {
          fontSize: 12,
          bold: true,
        },
        tableValue2: {
          fontSize: 12,
          bold: true,
          alignment: 'right' as 'right',
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
        const pdfUrl = await fileRef.getDownloadURL();

        const email = 'diegojb137@gmail.com';
        const subject = 'Tu pedido';
        const body = `
Hola, aquí encontrarás los detalles del pedido:

Copia el siguiente enlace en tu navegador para descargar el archivo:
${pdfUrl}

Enviado desde la aplicación.
`;

        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;


        this.toastr.success('Comprobante generado y enviado por correo correctamente.');
      }

    } catch (error) {
      console.error(error);
      this.toastr.error('Error al generar o subir el PDF. Por favor, inténtalo nuevamente.');
    }
  }
}
