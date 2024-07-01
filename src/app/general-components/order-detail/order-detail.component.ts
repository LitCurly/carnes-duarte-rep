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

  sendBoletaWhatsApp() {
    const boletaElement = document.querySelector('.receipt') as HTMLElement;
    if (boletaElement) {
      html2canvas(boletaElement).then(canvas => {
        canvas.toBlob(blob => {
          if (blob) {
            const formData = new FormData();
            formData.append('file', blob, 'boleta.png');

            const phoneNumber = '+56942274284';  // Reemplaza con el número de teléfono al que deseas enviar el mensaje
            const message = 'Hola, aquí está tu boleta de compra';  // Mensaje que deseas enviar

            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // Abre la URL de WhatsApp en una nueva ventana
            window.open(whatsappUrl, '_blank');

          }
        }, 'image/png');
      });
    }
  }
}
