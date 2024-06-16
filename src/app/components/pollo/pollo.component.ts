// src/app/components/pollo/pollo.component.ts
import { Component, OnInit } from '@angular/core';
import { CarneService } from '../../services/carne.service';
import { Carne } from '../../models/carne';

@Component({
  selector: 'app-pollo',
  templateUrl: './pollo.component.html',
  styleUrls: ['./pollo.component.css']
})
export class PolloComponent implements OnInit {
  cortes: string[] = [];

  constructor(private carneService: CarneService) { }

  ngOnInit(): void {
    this.carneService.getCarneCortes('pollo').subscribe((data: Carne) => {
      if (data.tipo === 'pollo') {
        this.cortes = data.cortes;
      }
    });
  }
}
