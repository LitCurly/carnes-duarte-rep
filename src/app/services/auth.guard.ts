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

      if (this.authService.isAuthenticated() && role === 'administrador' || this.authService.isAuthenticated() && role === 'superAdmin') {
        console.log('Acceso permitido a ruta protegida.');
        return true;
      } else {
        console.warn('Acceso denegado a ruta protegida.');
        this.router.navigate(['/inicio']);
        return false;
      }
    }).catch((error) => {
      console.error('Error en AuthGuard al obtener rol:', error);
      this.router.navigate(['/login']);
      return false;
    });
  }
}
