import { Component, OnInit } from '@angular/core';
import { CarneService } from '../../services/carne.service';
import { Carne, Corte } from '../../models/carne';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vacuno',
  templateUrl: './vacuno.component.html',
  styleUrls: ['./vacuno.component.css']
})
export class VacunoComponent implements OnInit {
  cortes: Corte[] = [];
  filteredCortes: Corte[] = [];
  searchQuery: string = '';

  constructor(private carneService: CarneService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.loadCortes();
    });
  }

  loadCortes(): void {
    this.carneService.getCarneCortes('vacuno').subscribe(data => {
      this.cortes = data.cortes;
      this.filteredCortes = this.cortes.filter(corte =>
        corte.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    });
  }

  onSearch(): void {
    this.router.navigate([], {
      queryParams: { search: this.searchQuery },
      queryParamsHandling: 'merge'
    });
  }
}
