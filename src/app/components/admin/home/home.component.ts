import { Component } from '@angular/core';
import { AuthService } from "../../../services/auth-service.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  sidebarClosed = false; // Estado inicial del sidebar (abierto)
  sidebarWidth = 250; // Ancho del sidebar cuando está abierto

  constructor(private authService: AuthService) { }

  // Método para alternar el estado del sidebar
  toggleSidebar(): void {
    this.sidebarClosed = !this.sidebarClosed;
    this.sidebarWidth = this.sidebarClosed ? 65 : 250; // Cambia el ancho según el estado del sidebar
  }

  logout(): void {
    this.authService.logout();
  }
}
