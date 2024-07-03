import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth-service.service';
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  loading = false; // Variable para manejar el estado de carga

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService, // ToastrService inyectado
    private router: Router // Router inyectado
  ) { }

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async resetPassword(): Promise<void> {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;
      this.loading = true; // Activar estado de carga

      try {
        await this.authService.resetPassword(email);
        // Mostrar mensaje de éxito
        this.toastr.success('Se ha enviado un correo para restablecer la contraseña', 'Correo Enviado');
        // Redirigir al componente de login (/login)
        this.router.navigate(['/login']);
      } catch (error) {
        // Manejar error de envío de correo de recuperación
        console.error('Error al enviar correo de recuperación:', error);
        // Mostrar mensaje de error específico si el correo no existe
        // @ts-ignore
        if (error.code === 'auth/user-not-found') {
          this.toastr.error('No existe una cuenta registrada con ese correo electrónico', 'Error');
        } else {
          this.toastr.error('Error al enviar correo de recuperación', 'Error');
        }
      } finally {
        this.loading = false; // Desactivar estado de carga
      }
    } else {
      // Mostrar mensaje de advertencia si el formulario es inválido
      this.toastr.warning('Por favor completa todos los campos', 'Atención');
    }
  }

  // Método para acceder al control del formulario desde el HTML
  get email() { return this.forgotPasswordForm.get('email'); }
}
