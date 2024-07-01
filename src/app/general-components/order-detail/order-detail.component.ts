import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../../models/order';
import { CartService } from "../../services/cart.service";

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {

  order: Order | undefined;
  orderId: string | null = null;

  constructor(
      private route: ActivatedRoute,
      private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.cartService.getOrderById(this.orderId).subscribe(order => {
        this.order = order;
      });
    }
  }

  formatDate(date: any): string {
    // Implementa tu lógica de formateo de fecha aquí si es necesario
    return date;
  }

  formatTime(date: any): string {
    // Implementa tu lógica de formateo de hora aquí si es necesario
    return date;
  }
}
