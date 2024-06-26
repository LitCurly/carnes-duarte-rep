import { Component, OnInit } from '@angular/core';
import { CarneService } from '../../../services/carne.service';
import { Corte } from '../../../models/carne';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../models/cart';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pollo',
  templateUrl: './pollo.component.html',
  styleUrls: ['./pollo.component.css']
})
export class PolloComponent implements OnInit {
  cortes: Corte[] = [];
  filteredCortes: Corte[] = [];
  paginatedCortes: Corte[] = [];
  searchQuery: string = '';
  selectedPreparation: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  quantities: { [corteId: string]: number } = {};

  constructor(
    private carneService: CarneService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private toastr: ToastrService
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
    this.carneService.getCarneCortes('pollo').subscribe(data => {
      this.cortes = data.cortes;
      this.cortes.forEach(corte => {
        this.quantities[corte.nombre] = 0;
      });
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

  addToCart(corte: Corte): void {
    const quantity = this.quantities[corte.nombre];
    if (quantity === 0) {
      this.toastr.error('Ingrese una cantidad válida para añadir los productos al carrito', 'Error');
    } else {
      const cartItem: CartItem = {
        nombre: corte.nombre,
        cantidad: quantity,
        precioPorKilo: corte.precioPorKilo,
        tipo: 'pollo',
        subtotal: quantity * corte.precioPorKilo
      };
      this.cartService.addToCart(cartItem);
      this.toastr.success(`Se han agregado ${quantity} kilos de ${corte.nombre} al carrito`, 'Éxito');
      this.quantities[corte.nombre] = 0;
    }
  }

  incrementQuantity(corte: Corte): void {
    this.quantities[corte.nombre]++;
  }

  decrementQuantity(corte: Corte): void {
    if (this.quantities[corte.nombre] > 0) {
      this.quantities[corte.nombre]--;
    }
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
