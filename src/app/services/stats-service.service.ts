import { Injectable } from '@angular/core';
import { CarneService } from './carne.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Corte} from "../models/carne";


@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private carneService: CarneService) { }

  // Método para obtener cortes de carne
  getCarneCortes(tipoCarne: string): Observable<Corte[]> {
    return this.carneService.getCarneCortes(tipoCarne).pipe(
      map(carne => carne.cortes)
    );
  }

  // Otros métodos para obtener estadísticas adicionales
}
