  import { Component, EventEmitter, Output } from '@angular/core';
  import { CartService } from '../../services/cart.service';
  import { Cart, CartItem } from '../../models/cart';
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
    quantities: { [nombre: string]: number } = {};
    showSpinner: boolean = false;

    constructor(
      private cartService: CartService,
      private toastr: ToastrService,
      private router: Router
    ) {
      this.cartService.getCart().subscribe(cart => {
        this.cart = cart;
        cart.items.forEach(item => {
          if (this.quantities[item.nombre] === undefined) {
            this.quantities[item.nombre] = 0;
          }
        });
      });
    }

    incrementQuantity(item: CartItem) {
      if (this.quantities[item.nombre] < item.cantidad) {
        this.quantities[item.nombre]++;
      } else {
        this.toastr.warning(`No puedes quitar más productos de los agregados.`, 'Cantidad máxima alcanzada');
      }
    }

    decrementQuantity(item: CartItem) {
      if (this.quantities[item.nombre] > 0) {
        this.quantities[item.nombre]--;
      }
    }

    removeFromCart(item: CartItem) {
      const quantityToRemove = this.quantities[item.nombre];

      if (quantityToRemove > 0) {
        const itemToRemove: CartItem = {
          nombre: item.nombre,
          cantidad: quantityToRemove,
          precioPorKilo: item.precioPorKilo,
          tipo: item.tipo,
          subtotal: item.subtotal
        };

        this.cartService.removeFromCart(itemToRemove);

        this.quantities[item.nombre] = 0;
      }
    }

    clearCart() {
      this.cartService.clearCart();
    }

    closeModalDialog() {
      this.modalOpen = false;
      this.closeModal.emit();
    }

    async confirmOrderCart() {
      this.cart.items.forEach(item => {
        const quantityToRemove = this.quantities[item.nombre];
        if (quantityToRemove > 0) {
          const itemToRemove: CartItem = {
            nombre: item.nombre,
            cantidad: quantityToRemove,
            precioPorKilo: item.precioPorKilo,
            tipo: item.tipo,
            subtotal: item.precioPorKilo * quantityToRemove
          };
          this.cartService.removeFromCart(itemToRemove);
        }
      });

      this.showSpinner = true;
      try {

        await this.cartService.confirmOrder(this.cart);
        this.toastr.success('Orden confirmada exitosamente', '¡Felicitaciones!');
        this.router.navigate(['/home/mis-pedidos']);
        this.closeModalDialog();
      } catch (error) {
        this.toastr.error('Error al confirmar la orden', '¡Oops!');
      } finally {
        this.showSpinner = false;
      }
    }
  }
