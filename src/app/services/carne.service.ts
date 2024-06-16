// src/app/services/carne.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Carne } from '../models/carne';

@Injectable({
  providedIn: 'root'
})
export class CarneService {

  constructor(private firestore: Firestore) { }

  getCarneCortes(tipoCarne: string): Observable<Carne> {
    const carneDoc = doc(this.firestore, `carnes/${tipoCarne}`);
    return docData(carneDoc) as Observable<Carne>;
  }
}
