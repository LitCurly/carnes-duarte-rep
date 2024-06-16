import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent {
  constructor(private router: Router) {} // Inyectar Router

  navigateTo(route: string) {
    this.router.navigate([`${route}`]);
  }
}
