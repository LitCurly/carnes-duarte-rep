import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../../models/order';
import { CartService } from "../../services/cart.service";
import html2canvas from 'html2canvas';

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
    private ordersService: CartService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.ordersService.getOrderById(this.orderId).subscribe(order => {
        this.order = order;
      });
    }
  }

  formatDate(date: any) {
    return date;
  }

  formatTime(date: any) {
    return date;
  }

  captureBoleta() {
    const boletaElement = document.querySelector('.receipt') as HTMLElement;
    if (boletaElement) {
      html2canvas(boletaElement).then(canvas => {
        const imageData = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imageData;
        a.download = 'boleta.png';
        a.click();
      });
    }
  }
}
