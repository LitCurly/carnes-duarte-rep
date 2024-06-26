import { Component, EventEmitter, Output } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/cart';
import { Order } from '../../models/order';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'carrito',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  cart: Cart = { items: [], total: 0 };
  modalOpen: boolean = true;
  quantities: { [nombre: string]: number } = {}; // Para manejar las cantidades de los items
  showSpinner: boolean = false; // Controla la visibilidad del spinner

  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router // Inyecta el servicio Router
  ) {
    this.cartService.getCart().subscribe(cart => {
      this.cart = cart;
      this.cart.items.forEach(item => {
        this.quantities[item.nombre] = 0; // Inicializar cantidades a 0
      });
    });
  }

  incrementQuantity(item: CartItem) {
    // Obtener la cantidad actual para este ítem en el carrito
    const currentQuantity = this.quantities[item.nombre];

    // Verificar si la cantidad actual es menor al stock disponible
    if (currentQuantity < item.cantidad) {
      // Incrementar la cantidad solo si no excede el stock disponible
      this.quantities[item.nombre]++;
    } else {
      // Mostrar un mensaje de error si se intenta superar el stock disponible
      this.toastr.warning(`No puedes agregar más ${item.nombre} de los disponibles`, 'Stock máximo alcanzado');
    }
  }

  decrementQuantity(item: CartItem) {
    if (this.quantities[item.nombre] > 0) {
      this.quantities[item.nombre]--;
    }
  }

  removeFromCart(item: CartItem) {
    const quantityToRemove = this.quantities[item.nombre];
    if (quantityToRemove === 0) {
      this.toastr.error('Ingrese una cantidad válida para quitar los productos del carrito', 'Error');
    } else {
      const itemToRemove: CartItem = {
        nombre: item.nombre,
        cantidad: quantityToRemove,
        precioPorKilo: item.precioPorKilo,
        tipo: item.tipo,
        subtotal: quantityToRemove * item.precioPorKilo // No se usa realmente en removeFromCart
      };
      this.cartService.removeFromCart(itemToRemove);
      this.toastr.success(`Se han quitado ${quantityToRemove} kilos de ${item.nombre} del carrito`, 'Éxito');
      this.quantities[item.nombre] = 0; // Restablecer la cantidad a cero después de quitar del carrito
    }
  }

  clearCart() {
    this.cartService.clearCart();
  }

  openModal(): void {
    this.modalOpen = true;
  }

  closeModalAndEmit(): void {
    this.modalOpen = false;
    this.closeModal.emit();
  }

  async createOrder() {
    const total = this.cart.items.reduce((acc, item) => acc + item.subtotal, 0);
    const order: Order = {
      items: this.cart.items,
      total: total, // Asegúrate de incluir el total en la orden
      createdAt: new Date() // Añadir la propiedad createdAt aquí
    };

    this.showSpinner = true;

    try {
      await this.cartService.createOrder(order);

      // Mostrar el spinner durante 3 segundos antes de proceder
      setTimeout(async () => {
        await this.router.navigate(['/mis-pedidos']);
        this.showSpinner = false;
        this.toastr.success('La compra se ha realizado exitosamente', 'Éxito');
        this.cartService.clearCart(); // Vaciar el carrito después de la navegación
        this.closeModalAndEmit(); // Cerrar el modal después de crear la orden y vaciar el carrito
      }, 3000);
    } catch (error) {
      this.showSpinner = false;
      this.toastr.error('Hubo un problema al procesar la compra', 'Error');
      console.error('Error al crear la orden:', error);
    }
  }

  cancelAction(): void {
    this.closeModalAndEmit();
  }
}
