import { Injectable } from '@angular/core';
import { CarneService } from './carne.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionGroup, getDocs, DocumentData } from '@angular/fire/firestore';
import { Order } from "../models/order";
import { CartItem } from "../models/cart";
import { Corte } from "../models/carne";

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private carneService: CarneService, private firestore: Firestore) {}

  // Método para obtener cortes de carne
  getCarneCortes(tipoCarne: string): Observable<Corte[]> {
    return this.carneService.getCarneCortes(tipoCarne).pipe(
      map(carne => carne.cortes)
    );
  }

  // Método para obtener todas las órdenes
  getAllOrders(): Observable<Order[]> {
    const ordersCollection = collectionGroup(this.firestore, 'orders');
    return from(getDocs(ordersCollection)).pipe(
      map((querySnapshot: any) => {
        return querySnapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
            id: doc.id,
            items: data.items as CartItem[],
            createdAt: data.createdAt.toDate(), // Asegúrate de que 'createdAt' sea un Timestamp en Firestore
            total: data.total || 0,
            boletaURL: data.boletaURL || null
            // Agrega otros campos según sea necesario
          } as Order;
        });
      })
    );
  }
}
