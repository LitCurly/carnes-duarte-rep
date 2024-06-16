// src/app/components/cerdo/cerdo.component.ts
import { Component, OnInit } from '@angular/core';
import { CarneService } from '../../services/carne.service';
import { Carne } from '../../models/carne';

@Component({
  selector: 'app-cerdo',
  templateUrl: './cerdo.component.html',
  styleUrls: ['./cerdo.component.css']
})
export class CerdoComponent implements OnInit {
  cortes: string[] = [];

  constructor(private carneService: CarneService) { }

  ngOnInit(): void {
    this.carneService.getCarneCortes('cerdo').subscribe((data: Carne) => {
      if (data.tipo === 'cerdo') {
        this.cortes = data.cortes;
      }
    });
  }
}
