import { Injectable } from '@angular/core'
import { CarneService } from './carne.service'
import { Observable, from } from 'rxjs'
import { map } from 'rxjs/operators'
import { Firestore, collectionGroup, getDocs, DocumentData, Timestamp } from '@angular/fire/firestore' // Asegúrate de importar Timestamp
import { Order } from '../models/order'
import { CartItem } from '../models/cart'
import { Corte } from '../models/carne'

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  constructor(
    private carneService: CarneService,
    private firestore: Firestore
  ) {}

  // Método para obtener cortes de carne
  getCarneCortes(tipoCarne: string): Observable<Corte[]> {
    return this.carneService.getCarneCortes(tipoCarne).pipe(map((carne) => carne.cortes))
  }

  // Método para obtener todas las órdenes
  getAllOrders(): Observable<Order[]> {
    const ordersCollection = collectionGroup(this.firestore, 'orders')
    return from(getDocs(ordersCollection)).pipe(
      map((querySnapshot: any) => {
        return querySnapshot.docs
          .map((doc: any) => {
            const data = doc.data()
            let createdAt: Date | Timestamp

            if (data.createdAt instanceof Timestamp) {
              createdAt = data.createdAt.toDate()
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt
            } else {
              console.error('Invalid createdAt data:', data.createdAt)
              return null // O maneja el caso de error de alguna otra manera
            }

            return {
              id: doc.id,
              items: data.items as CartItem[],
              createdAt: createdAt,
              total: data.total || 0,
              boletaURL: data.boletaURL || null,
              // Agrega otros campos según sea necesario
            } as Order
          })
          .filter((order: Order | null) => order !== null) // Filtra los elementos nulos por errores
      })
    )
  }

  getMostPurchasedMeat(orders: Order[]): { [key: string]: number } {
    const meatCounts: { [key: string]: number } = {}

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (meatCounts[item.nombre]) {
          meatCounts[item.nombre] += item.cantidad
        } else {
          meatCounts[item.nombre] = item.cantidad
        }
      })
    })

    return meatCounts
  }

  getMostPurchasedCuts(orders: Order[]): { [key: string]: number } {
    const meatTypeCounts: { [key: string]: number } = {}

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const tipo = item.tipo // Asumimos que `item.tipo` contiene "pollo", "cerdo", "vacuno", etc.
        if (meatTypeCounts[tipo]) {
          meatTypeCounts[tipo] += item.cantidad
        } else {
          meatTypeCounts[tipo] = item.cantidad
        }
      })
    })

    return meatTypeCounts
  }
}
