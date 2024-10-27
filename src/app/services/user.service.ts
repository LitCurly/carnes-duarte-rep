import { Injectable } from '@angular/core';
import {Firestore, collectionData, collection, doc, deleteDoc, updateDoc} from '@angular/fire/firestore';
import {BehaviorSubject, from, Observable, tap} from 'rxjs';
import {StatusEnum} from "../models/order";


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor(
    private firestore: Firestore,
  ) { }

  setUserData(userData: any): void {
    this.userDataSubject.next(userData);
  }


  getUsers(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' }) as Observable<any[]>;
  }

  getOrdersByUser(userId: string): Observable<any[]> {
    const ordersCollection = collection(this.firestore, `ordenes/${userId}/orders`);
    return collectionData(ordersCollection, { idField: 'id' }).pipe(
      tap(orders => {
        console.log(`Órdenes obtenidas para el usuario ${userId}:`, orders);
        if (orders.length === 0) {
          console.warn(`El usuario ${userId} no tiene órdenes.`);
        }
      })
    ) as Observable<any[]>;
  }

  updateOrderStatus(userId: string, orderId: string, newStatus: StatusEnum): Observable<void> {
    const orderRef = doc(this.firestore, `ordenes/${userId}/orders/${orderId}`);
    console.log(`Actualizando orden: userId=${userId}, orderId=${orderId}, newStatus=${newStatus}`);
    return from(updateDoc(orderRef, { status: newStatus }));
  }

  updateUserRole(userId: string, newRole: string): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return new Observable<void>((observer) => {
      updateDoc(userDocRef, { rol: newRole }).then(() => {
        observer.next();
        observer.complete();
      }).catch((error) => {
        observer.error(error);
      });
    });
  }
}
