import { Component } from '@angular/core';

@Component({
  selector: 'header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})
export class HeaderComponentComponent {
  showCartModal: boolean = false;

  openCartModal(): void {
    this.showCartModal = true;
  }

  closeCartModal(): void {
    console.log('Cerrar modal'); // Verificar si se imprime en la consola
    this.showCartModal = false;
  }
}
