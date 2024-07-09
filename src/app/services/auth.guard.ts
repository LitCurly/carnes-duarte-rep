import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.getUserRole().then(role => {
      console.log('Rol obtenido en AuthGuard:', role); // Mensaje de consola agregado

      if (this.authService.isAuthenticated() && role === 'administrador') {
        console.log('Acceso permitido a ruta protegida.');
        return true; // Permitir la navegación si está autenticado y es administrador
      } else {
        console.warn('Acceso denegado a ruta protegida.');
        this.router.navigate(['/inicio']); // Redirigir a /inicio si no cumple los requisitos
        return false;
      }
    }).catch((error) => {
      console.error('Error en AuthGuard al obtener rol:', error); // Mensaje de consola agregado
      this.router.navigate(['/login']); // Redirigir al login si hay un error al obtener el rol
      return false;
    });
  }
}
