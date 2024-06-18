import { Component, OnInit } from '@angular/core';
import { CarneService } from '../../../services/carne.service';
import { Carne, Corte } from '../../../models/carne';
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
  selectedPreparation: string = '';

  constructor(
    private carneService: CarneService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.selectedPreparation = params['preparation'] || '';
      this.loadCortes();
    });
  }

  loadCortes(): void {
    this.carneService.getCarneCortes('vacuno').subscribe(data => {
      this.cortes = data.cortes;
      this.filterCortes();
    });
  }

  filterCortes(): void {
    this.filteredCortes = this.cortes.filter(corte => {
      const matchesName = corte.nombre.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPreparation = this.selectedPreparation
        ? corte.preparaciones.includes(this.selectedPreparation)
        : true;
      return matchesName && matchesPreparation;
    });
  }

  onSearch(): void {
    this.router.navigate([], {
      queryParams: { search: this.searchQuery, preparation: this.selectedPreparation },
      queryParamsHandling: 'merge'
    });
    this.filterCortes();
  }

  goBack(): void {
    this.router.navigate(['/productos']);
  }
}
