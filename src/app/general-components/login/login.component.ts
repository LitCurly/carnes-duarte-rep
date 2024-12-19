import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '../../services/auth-service.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  loading = false
  incorrectPassword = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }

  async login(): Promise<void> {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email
      const password = this.loginForm.value.password
      this.loading = true
      this.incorrectPassword = false

      try {
        await this.authService.loginWithEmailAndPassword(email, password)
        this.toastr.success('Inicio de sesión exitoso', '¡Bienvenido!')
      } catch (error) {
        // @ts-ignore
        if (error.code === 'auth/wrong-password') {
          this.incorrectPassword = true
          this.toastr.error('La contraseña ingresada es incorrecta.', 'Error de autenticación')
          // @ts-ignore
        } else if (error.code === 'auth/user-not-found') {
          this.toastr.error(
            'No se encontró una cuenta con este correo electrónico.',
            'Error de autenticación'
          )
          // @ts-ignore
        } else if (error.code === 'auth/too-many-requests') {
          this.toastr.warning(
            'Se han hecho demasiados intentos de inicio de sesión. Inténtalo más tarde.',
            'Advertencia'
          )
        } else {
          this.toastr.error('Error al iniciar sesión. Por favor, intenta nuevamente.', 'Error')
        }
        console.error('Error al iniciar sesión:', error)
      } finally {
        this.loading = false
      }
    } else {
      this.toastr.warning('Por favor completa todos los campos correctamente.', 'Atención')
    }
  }

  get email() {
    return this.loginForm.get('email')
  }
  get password() {
    return this.loginForm.get('password')
  }
}
