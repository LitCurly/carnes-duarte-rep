import { Injectable } from '@angular/core'
import {
  Firestore,
  doc,
  docData,
  getDoc,
  updateDoc,
  arrayUnion,
  collectionData,
  collection,
  arrayRemove,
  DocumentData,
  getDocs,
} from '@angular/fire/firestore'
import { Observable } from 'rxjs'
import { Carne, Corte } from '../models/carne'
import { ToastrService } from 'ngx-toastr'
import { map } from 'rxjs/operators'
import firebase from 'firebase/compat/app'

@Injectable({
  providedIn: 'root',
})
export class CarneService {
  constructor(
    private firestore: Firestore,
    private toastr: ToastrService
  ) {}

  getCarneCortes(tipoCarne: string): Observable<Carne> {
    const carneDoc = doc(this.firestore, `carnes/${tipoCarne}`)
    return docData(carneDoc) as Observable<Carne>
  }

  getAllCortes(): Observable<Carne[]> {
    const carnesCollection = collection(this.firestore, 'carnes')
    const querySnapshot = collectionData(carnesCollection, { idField: 'id' })

    return querySnapshot.pipe(
      map((carnes: DocumentData[]) => {
        return carnes.map((carneData) => {
          const carne = carneData as Carne
          // Ordenar los cortes por createdAt de manera descendente
          if (carne.cortes) {
            carne.cortes.sort((a: Corte, b: Corte) => {
              const createdAtA = this.getTimestamp(a.createdAt).toDate().getTime() || 0
              const createdAtB = this.getTimestamp(b.createdAt).toDate().getTime() || 0
              return createdAtB - createdAtA
            })
          }
          return carne
        })
      })
    )
  }

  private getTimestamp(date: any): firebase.firestore.Timestamp {
    return date instanceof firebase.firestore.Timestamp
      ? date
      : (date?.toDate() as firebase.firestore.Timestamp)
  }

  async agregarCorte(tipoCarne: string, corte: Corte): Promise<void> {
    try {
      const carneRef = doc(this.firestore, `carnes/${tipoCarne}`)
      const carneDoc = await getDoc(carneRef)

      if (carneDoc.exists()) {
        await updateDoc(carneRef, {
          cortes: arrayUnion(corte),
        })
        this.toastr.success('Corte agregado correctamente', 'Éxito')
      } else {
        await updateDoc(carneRef, {
          cortes: [corte],
        })
        this.toastr.success('Primer corte agregado correctamente', 'Éxito')
      }
    } catch (error: any) {
      this.toastr.error('Error al agregar corte', 'Error')
      console.error('Error adding corte: ', error)
      throw error
    }
  }

  async eliminarCorte(corte: Corte, tipoCarne: string): Promise<void> {
    try {
      const carneRef = doc(this.firestore, `carnes/${tipoCarne}`)
      const carneDoc = await getDoc(carneRef)

      if (carneDoc.exists()) {
        const updatedCortes = (carneDoc.data() as any)['cortes'].filter(
          (c: Corte) => c.nombre !== corte.nombre
        )

        await updateDoc(carneRef, {
          cortes: updatedCortes,
        })

        this.toastr.success('Corte eliminado correctamente', 'Éxito')
      } else {
        this.toastr.error('No se encontró la carne', 'Error')
      }
    } catch (error: any) {
      this.toastr.error('Error al eliminar corte', 'Error')
      console.error('Error al eliminar corte:', error)
      throw error
    }
  }

  async actualizarCorte(tipoCarne: string, corteId: string, corteActualizado: Corte): Promise<void> {
    try {
      // Obtén la referencia al documento de Firestore para el tipo de carne
      const carneRef = doc(this.firestore, `carnes/${tipoCarne}`)
      const carneSnap = await getDoc(carneRef)

      if (carneSnap.exists()) {
        const data = carneSnap.data()
        const cortes = data?.['cortes'] || []

        // Encuentra el índice del corte en el array `cortes`
        const corteIndex = cortes.findIndex((corte: Corte) => corte.nombre === corteId)
        if (corteIndex !== -1) {
          // Actualiza el corte en la posición correcta
          cortes[corteIndex] = { ...corteActualizado }

          // Actualiza el documento en Firestore
          await updateDoc(carneRef, { cortes })
        } else {
          throw new Error('Corte no encontrado')
        }
      } else {
        throw new Error('Documento de carne no encontrado')
      }
    } catch (error) {
      console.error('Error actualizando el corte:', error)
      throw error
    }
  }
}
