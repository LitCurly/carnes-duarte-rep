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
  paginatedCortes: Corte[] = [];
  searchQuery: string = '';
  selectedPreparation: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10; // Mostrar 10 elementos por página
  totalPages: number = 1;
  tableHeight: any;

  constructor(
    private carneService: CarneService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.selectedPreparation = params['preparation'] || '';
      this.currentPage = +params['page'] || 1;
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
    this.totalPages = Math.ceil(this.filteredCortes.length / this.itemsPerPage);
    this.paginateCortes();
  }

  paginateCortes(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCortes = this.filteredCortes.slice(start, end);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateQueryParams();
    this.filterCortes();
  }

  updateQueryParams(): void {
    this.router.navigate([], {
      queryParams: {
        search: this.searchQuery,
        preparation: this.selectedPreparation,
        page: this.currentPage
      },
      queryParamsHandling: 'merge'
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateQueryParams();
      this.paginateCortes();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateQueryParams();
      this.paginateCortes();
    }
  }

  goBack(): void {
    this.router.navigate(['/productos']);
  }
}
