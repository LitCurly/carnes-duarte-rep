import { Injectable } from '@angular/core';
import {Firestore, doc, docData, setDoc, getDoc, collection, addDoc, collectionData} from '@angular/fire/firestore';
import {Observable, Timestamp} from 'rxjs';
import { Cart, CartItem } from '../models/cart';
import { map } from 'rxjs/operators';
import {Order} from "../models/order";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private firestore: Firestore) { }

  // Método para obtener el carrito actual desde Firestore
  getCart(): Observable<Cart> {
    const cartDoc = doc(this.firestore, 'carritos/default-cart');
    return docData(cartDoc).pipe(
      map((data: any) => {
        // Asegurarse de que los datos devueltos tengan la estructura de Cart
        const cart: Cart = {
          items: data.items ? data.items : [], // Usar operador ternario para asegurar que items esté definido
          total: data.total ? data.total : 0 // Asegurar que total esté definido
        };
        return cart;
      })
    );
  }

  // Método para agregar un producto al carrito
  async addToCart(item: CartItem): Promise<void> {
    const cartDocRef = doc(this.firestore, 'carritos/default-cart');
    let cartData: any;

    try {
      const cartSnapshot = await getDoc(cartDocRef);
      if (cartSnapshot.exists()) {
        cartData = cartSnapshot.data();
      } else {
        // Si no existe el documento, inicializar con una estructura vacía
        cartData = { items: [], total: 0 };
      }

      // Verificar si existe el campo items[] y crearlo si no existe
      if (!cartData.hasOwnProperty('items')) {
        cartData['items'] = [];
      }

      const existingItemIndex = cartData['items'].findIndex((i: CartItem) => i.nombre === item.nombre && i.tipo === item.tipo);

      if (existingItemIndex !== -1) {
        cartData['items'][existingItemIndex].cantidad += item.cantidad;
        // Actualizar subtotal del ítem existente
        cartData['items'][existingItemIndex].subtotal = cartData['items'][existingItemIndex].cantidad * cartData['items'][existingItemIndex].precioPorKilo;
      } else {
        // Añadir el nuevo producto al carrito
        const newItem: CartItem = {
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioPorKilo: item.precioPorKilo,
          tipo: item.tipo,
          subtotal: item.cantidad * item.precioPorKilo // Calcular subtotal del nuevo ítem
        };
        cartData['items'].push(newItem);
      }

      // Calcular el total del carrito
      cartData.total = this.calculateTotal(cartData.items);

      // Guardar o actualizar el documento en Firestore
      await setDoc(cartDocRef, cartData);

    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  // Método para quitar una cantidad específica de un producto del carrito
  async removeFromCart(item: CartItem): Promise<void> {
    const cartDocRef = doc(this.firestore, 'carritos/default-cart');
    let cartData: any;

    try {
      const cartSnapshot = await getDoc(cartDocRef);
      if (cartSnapshot.exists()) {
        cartData = cartSnapshot.data();
      } else {
        console.error('El carrito no existe');
        return;
      }

      // Verificar si existe el campo items[] y manejar la lógica de eliminación
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
          // Actualizar subtotal del ítem existente
          cartData['items'][existingItemIndex].subtotal = cartData['items'][existingItemIndex].cantidad * cartData['items'][existingItemIndex].precioPorKilo;
        }

        // Calcular el total del carrito
        cartData.total = this.calculateTotal(cartData.items);

        // Guardar o actualizar el documento en Firestore
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
    const cartDocRef = doc(this.firestore, 'carritos/default-cart');
    await setDoc(cartDocRef, { items: [], total: 0 });
  }

  // Método para obtener todas las órdenes desde Firestore
  getAllOrders(): Observable<Order[]> {
    const ordersCollection = collection(this.firestore, 'ordenes');
    return collectionData(ordersCollection, { idField: 'id' }).pipe(
      map((orders: any[]) => orders.map(order => ({
        ...order,
        createdAt: (order.createdAt as any).toDate() // Asegurarse de que `createdAt` sea un objeto `Timestamp` y convertirlo a `Date`
      })) as Order[])
    );
  }

  // Método para crear una orden de compra
  async createOrder(order: Order): Promise<void> {
    const ordenesCollectionRef = collection(this.firestore, 'ordenes');

    try {
      const newOrderRef = await addDoc(ordenesCollectionRef, {
        ...order,
        createdAt: new Date() // Guardar la fecha de emisión de la orden
      });

      console.log('Orden creada con ID:', newOrderRef.id);

      // Limpiar el carrito después de crear la orden
      await this.clearCart();

    } catch (error) {
      console.error('Error creating order:', error);
    }
  }

  // Función auxiliar para calcular el total del carrito
  private calculateTotal(items: CartItem[]): number {
    let total = 0;
    items.forEach(item => {
      total += item.subtotal ? item.subtotal : (item.cantidad * item.precioPorKilo);
    });
    return total;
  }
}
