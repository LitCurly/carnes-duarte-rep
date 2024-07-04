import { Injectable } from '@angular/core';
import { Firestore, doc, docData, getDoc, collection, addDoc, collectionData, setDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Cart, CartItem } from '../models/cart';
import { map } from 'rxjs/operators';
import { Order } from "../models/order";
import { AuthService } from "./auth-service.service";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private firestore: Firestore, private authService: AuthService) { }

  // Método para obtener el carrito actual desde Firestore
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

  // Método para agregar un producto al carrito
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

  // Método para quitar una cantidad específica de un producto del carrito
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

  // Método para vaciar el carrito
  async clearCart(): Promise<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    const cartDocRef = doc(this.firestore, `carritos/${userId}`);
    await setDoc(cartDocRef, { items: [], total: 0 });
  }

  // Método para obtener todas las órdenes desde Firestore
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
          createdAt: order.createdAt.toDate(), // Convertir a Date
          total: order.total || 0, // Asegurarse de tener un valor por defecto si es necesario
          items: order.items || [] // Asegurarse de tener un arreglo vacío si es necesario
          // Agrega otros campos según la estructura de tu modelo Order
        })) as Order[];
      })
    );
  }

  // Método para obtener una orden por su ID
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
          const data = snapshot.data() as Order; // Castear a la interfaz Order
          return {
            id: orderId,
            items: data['items'], // Acceder usando corchetes
            createdAt: (data['createdAt'] as any).toDate(), // Acceder usando corchetes
            total: data['total'], // Acceder usando corchetes
            boletaURL: data['boletaURL'], // Acceder usando corchetes
          };
        } else {
          return undefined;
        }
      })
    );
  }

// Método para confirmar una orden de compra
  async confirmOrder(cart: Cart): Promise<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const ordersCollection = collection(this.firestore, `ordenes/${userId}/orders`);
    const orderData: Order = {
      items: cart.items,
      createdAt: new Date(),
      total: this.calculateTotal(cart.items)  // Calcular el total usando el método calculateTotal
    };

    try {
      const docRef = await addDoc(ordersCollection, orderData);
      const orderId = docRef.id; // Obtener el ID generado por Firestore

      // Guardar el ID dentro de los datos de la orden
      await setDoc(doc(this.firestore, `ordenes/${userId}/orders/${orderId}`), {
        ...orderData,
        id: orderId // Guardar el ID dentro de los datos de la orden
      });

      await this.clearCart();
    } catch (error) {
      console.error('Error al confirmar la orden:', error);
    }
  }

// Método para calcular el total del carrito
  private calculateTotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + item.subtotal, 0);
  }

}
