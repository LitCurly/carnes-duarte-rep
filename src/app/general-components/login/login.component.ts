import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Importa Router
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false; // Variable para manejar el estado de carga
  incorrectPassword = false; // Variable para controlar mensaje de contraseña incorrecta

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService, // ToastrService inyectado
    private router: Router // Router inyectado
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login(): Promise<void> {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      this.loading = true; // Activar estado de carga
      this.incorrectPassword = false; // Reiniciar estado de contraseña incorrecta

      try {
        await this.authService.loginWithEmailAndPassword(email, password);
        this.toastr.success('Inicio de sesión exitoso', '¡Bienvenido!');
        // Redirigir al usuario a /inicio después de iniciar sesión exitosamente
        this.router.navigate(['/inicio']);
      } catch (error) {
        // Manejar diferentes tipos de errores de autenticación
        // @ts-ignore
        if (error.code === 'auth/wrong-password') {
          this.incorrectPassword = true; // Activar mensaje de contraseña incorrecta
        } else {
          this.toastr.error('Error al iniciar sesión', 'Error');
          console.error('Error al iniciar sesión:', error);
        }
      } finally {
        this.loading = false; // Desactivar estado de carga
      }
    } else {
      this.toastr.warning('Por favor completa todos los campos', 'Atención');
    }
  }

  // Método para acceder al control del formulario desde el HTML
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
