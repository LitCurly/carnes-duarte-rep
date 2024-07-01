import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Order } from '../../models/order';

@Component({
  selector: 'order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orders: Order[] = [];
  paginatedOrders: Order[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.cartService.getAllOrders().subscribe(
      (orders: Order[]) => {
        this.orders = orders;
        this.totalPages = Math.ceil(this.orders.length / this.itemsPerPage);
        this.paginateOrders();
      },
      error => {
        console.error('Error al cargar las órdenes:', error);
      }
    );
  }

  paginateOrders(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedOrders = this.orders.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateOrders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateOrders();
    }
  }

  getCorteNames(order: Order): string {
    return order.items.map(item => item.nombre).join(', ');
  }

  getShortCorteNames(order: Order): string {
    const nombres = order.items.map(item => item.nombre);
    if (nombres.length <= 3) {
      return nombres.join(', ');
    }
    return nombres.slice(0, 3).join(', ') + '...';
  }

  formatDate(dateTime: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    // Formatear solo la fecha
    return dateTime.toLocaleDateString('es-ES', options);
  }

  formatTime(dateTime: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric'
    };

    // Formatear solo la hora
    return dateTime.toLocaleTimeString('es-ES', options);
  }

  goToOrderDetail(orderId: string): void {
    this.router.navigate(['/mis-pedidos', orderId, 'order-detail']);
  }
}
