import {Injectable} from '@angular/core';
import {addDoc, collection, collectionData, doc, docData, Firestore, getDoc, setDoc,} from '@angular/fire/firestore';
import {from, Observable} from 'rxjs';
import {Cart, CartItem} from '../models/cart';
import {map} from 'rxjs/operators';
import {Order, StatusEnum} from "../models/order";
import {AuthService} from "./auth-service.service";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "@angular/fire/storage";
import {User} from "../models/user";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class CartService {
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

  constructor(private firestore: Firestore, private authService: AuthService) { }

  getCart(): Observable<Cart> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    const cartDoc = doc(this.firestore, `carritos/${userId}`);
    return docData(cartDoc).pipe(
      map((data: any) => {
        const cart: Cart = {
          items: data.items ? data.items : [],
          total: data.total ? data.total : 0
        };
        return cart;
      })
    );
  }

  async addToCart(item: CartItem): Promise<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    const cartDocRef = doc(this.firestore, `carritos/${userId}`);
    let cartData: any;

    try {
      const cartSnapshot = await getDoc(cartDocRef);
      if (cartSnapshot.exists()) {
        cartData = cartSnapshot.data();
      } else {
        cartData = { items: [], total: 0 };
      }

      if (!cartData.hasOwnProperty('items')) {
        cartData['items'] = [];
      }

      const existingItemIndex = cartData['items'].findIndex((i: CartItem) => i.nombre === item.nombre && i.tipo === item.tipo);

      if (existingItemIndex !== -1) {
        cartData['items'][existingItemIndex].cantidad += item.cantidad;
        cartData['items'][existingItemIndex].subtotal = cartData['items'][existingItemIndex].cantidad * cartData['items'][existingItemIndex].precioPorKilo;
      } else {
        const newItem: CartItem = {
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioPorKilo: item.precioPorKilo,
          tipo: item.tipo,
          subtotal: item.cantidad * item.precioPorKilo
        };
        cartData['items'].push(newItem);
      }

      cartData.total = this.calculateTotal(cartData.items);

      await setDoc(cartDocRef, cartData);

    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  async removeFromCart(item: CartItem): Promise<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    const cartDocRef = doc(this.firestore, `carritos/${userId}`);
    let cartData: any;

    try {
      const cartSnapshot = await getDoc(cartDocRef);
      if (cartSnapshot.exists()) {
        cartData = cartSnapshot.data();
      } else {
        console.error('El carrito no existe');
        return;
      }

      if (!cartData.hasOwnProperty('items')) {
        console.error('El carrito no contiene ningún producto');
        return;
      }

      const existingItemIndex = cartData['items'].findIndex((i: CartItem) => i.nombre === item.nombre && i.tipo === item.tipo);

      if (existingItemIndex !== -1) {
        cartData['items'][existingItemIndex].cantidad -= item.cantidad;
        if (cartData['items'][existingItemIndex].cantidad <= 0) {
          cartData['items'].splice(existingItemIndex, 1);
        } else {
          cartData['items'][existingItemIndex].subtotal = cartData['items'][existingItemIndex].cantidad * cartData['items'][existingItemIndex].precioPorKilo;
        }

        cartData.total = this.calculateTotal(cartData.items);

        await setDoc(cartDocRef, cartData);
      } else {
        console.error('El producto no se encuentra en el carrito');
      }

    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  getAllOrders(): Observable<Order[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const ordersCollection = collection(this.firestore, `ordenes/${userId}/orders`);
    // @ts-ignore
    return collectionData(ordersCollection, { idField: 'id', orderBy: ['createdAt', 'desc'] }).pipe(
      map((orders: any[]) => {
        return orders.map(order => ({
          id: order.id,
          createdAt: order.createdAt.toDate(),
          total: order.total || 0,
          items: order.items || []
        })) as Order[];
      })
    );
  }

  getOrderById(orderId: string): Observable<Order | undefined> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const orderDocRef = doc(this.firestore, `ordenes/${userId}/orders/${orderId}`);
    const orderDocPromise = getDoc(orderDocRef);

    return from(orderDocPromise).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Order;
          return {
            id: orderId,
            items: data['items'],
            createdAt: (data['createdAt'] as any).toDate(),
            total: data['total'],
            boletaURL: data['boletaURL'],
          };
        } else {
          return undefined;
        }
      })
    );
  }

  async clearCart(): Promise<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    const cartDocRef = doc(this.firestore, `carritos/${userId}`);
    await setDoc(cartDocRef, { items: [], total: 0 });
  }

  async confirmOrder(cart: Cart): Promise<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const ordersCollection = collection(this.firestore, `ordenes/${userId}/orders`);
    const orderData: Order = {
      items: cart.items,
      createdAt: new Date(),
      total: this.calculateTotal(cart.items),
      status: StatusEnum.Pendiente,

    };

    try {
      const docRef = await addDoc(ordersCollection, orderData);
      const orderId = docRef.id;

      await this.generateAndUploadPdf(cart, orderId);

      await setDoc(doc(this.firestore, `ordenes/${userId}/orders/${orderId}`), {
        ...orderData,
        id: orderId
      });

      await this.clearCart();
    } catch (error) {
      console.error('Error al confirmar la orden:', error);
    }
  }

  private async generateAndUploadPdf(cart: Cart, orderId: string): Promise<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userDocSnapshot = await getDoc(userDocRef);
    let userData: User = {} as User;
    if (userDocSnapshot.exists()) {
      userData = userDocSnapshot.data() as User;
    }

    const docDefinition = {
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
              ['',''],
              [
                {
                  text: 'Fecha de Emisión:',
                  style: 'tableTitle',
                },
                {
                  text: `${new Date().toLocaleString()}`,
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
                  text: `${this.capitalizeFirstLetter(userData['nombre'])}`,
                  style: 'tableValue',
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
                  text: 'RUT Cliente:',
                  style: 'tableTitle',
                },
                {
                  text: `${this.formatRutUserData(userData['rut'])}`,
                  style: 'tableValue',
                },
                {
                  text: 'Teléfono:',
                  style: 'tableTitle',
                },
                {
                  text: `${userData['telefono']}`,
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
                  text: `${this.capitalizeFirstLetter(userData.direccion ?? '')}`,
                  style: 'tableValue',
                }
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
                  text: `${this.capitalizeFirstLetter(userData['email'])}`,
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
        {
          table: {
            headerRows: 1,
            widths: [260, 'auto', 150],
            body: [
              [
                { text: 'Descripción Cantidad x Precio', style: 'tableHeader' },
                { text: 'Unidad de Medida', style: 'tableHeader' },
                { text: 'Valor', style: 'tableHeader'}
              ],
              ...cart.items.map((item: CartItem) => [
                `${item.nombre} de ${item.tipo} ${item.cantidad} x ${this.formatCurrency(item.precioPorKilo)}`,
                `Kilogramos`,
                `${this.formatCurrency(item.cantidad * item.precioPorKilo)}`
              ])

            ]
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
        },
        {
          text: `Total: ${this.formatCurrency(cart.items.reduce((total, item) => total + (item.cantidad * item.precioPorKilo), 0))}`,
          style: 'total',
        }
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

    const pdfDoc = pdfMake.createPdf(docDefinition);

    const pdfBlob = await new Promise<Blob>((resolve) => {
      pdfDoc.getBlob(resolve);
    });

    const storage = getStorage();
    const pdfRef = ref(storage, `orders/${userId}/${orderId}/boleta.pdf`);
    const uploadTask = uploadBytesResumable(pdfRef, pdfBlob);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Opcional: Puedes hacer algo mientras se sube el archivo (ej. progreso de la carga)
      },
      (error) => {
        console.error('Error al subir el PDF a Storage:', error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        const userId = this.authService.getUserId();
        await setDoc(doc(this.firestore, `ordenes/${userId}/orders/${orderId}`), {
          boletaURL: downloadURL
        }, { merge: true });
      }
    );
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + item.subtotal, 0);
  }

  formatRutUserData(rut: string): string {
    if (!rut) return '';
    rut = rut.replace(/\D/g, '');
    const rutFormateado = `${rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${rut.slice(-1)}`;
    return rutFormateado;
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined) return ''; // Handle undefined case gracefully
    return '$ ' + value.toLocaleString('es-CL') + ' CLP';
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
