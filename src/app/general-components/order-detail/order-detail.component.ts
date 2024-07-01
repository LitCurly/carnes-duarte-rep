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
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'boleta.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      });
    }
  }

  sendBoletaWhatsApp() {
    const boletaElement = document.querySelector('.receipt') as HTMLElement;
    if (boletaElement) {
      html2canvas(boletaElement).then(canvas => {
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const formData = new FormData();
            formData.append('file', blob, 'boleta.png');

            // Aquí puedes usar la API de WhatsApp para enviar la imagen
            // Necesitarás implementar una API backend para manejar el envío a WhatsApp
            // Este es un ejemplo de cómo podrías enviar la imagen al backend
            fetch('URL_DE_TU_API/whatsapp/send', {
              method: 'POST',
              body: formData
            })
              .then(response => response.json())
              .then(data => {
                console.log('Imagen enviada a WhatsApp:', data);
              })
              .catch(error => {
                console.error('Error al enviar la imagen a WhatsApp:', error);
              });

            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      });
    }
  }
}
