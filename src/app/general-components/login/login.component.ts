import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  incorrectPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
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
      this.loading = true;
      this.incorrectPassword = false;

      try {
        await this.authService.loginWithEmailAndPassword(email, password);
        // No se requiere redirección aquí, se maneja en el servicio AuthService
      } catch (error) {
        // @ts-ignore
        if (error.code === 'auth/wrong-password') {
          this.incorrectPassword = true;
        } else {
          this.toastr.error('Error al iniciar sesión', 'Error');
          console.error('Error al iniciar sesión:', error);
        }
      } finally {
        this.loading = false;
      }
    } else {
      this.toastr.warning('Por favor completa todos los campos', 'Atención');
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
