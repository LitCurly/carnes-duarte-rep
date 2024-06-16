// src/app/components/vacuno/vacuno.component.ts
import { Component, OnInit } from '@angular/core';
import { CarneService } from '../../services/carne.service';
import { Carne } from '../../models/carne';

@Component({
  selector: 'app-vacuno',
  templateUrl: './vacuno.component.html',
  styleUrls: ['./vacuno.component.css']
})
export class VacunoComponent implements OnInit {
  cortes: string[] = [];

  constructor(private carneService: CarneService) { }

  ngOnInit(): void {
    this.carneService.getCarneCortes('vacuno').subscribe((data: Carne) => {
      if (data.tipo === 'vacuno') {
        this.cortes = data.cortes;
      }
    });
  }
}
