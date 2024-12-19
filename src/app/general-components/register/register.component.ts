import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import { Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '../../services/auth-service.service'
import { User } from '../../models/user'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup
  loading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        nombre: ['', Validators.required],
        segundoNombre: [''],
        apellido: ['', Validators.required],
        segundoApellido: [''],
        rut: ['', Validators.required],
        telefono: ['', Validators.required],
        direccion: [''],
        rol: ['usuario', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    )
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')
    const confirmPassword = control.get('confirmPassword')
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true }
    }
    return null
  }

  async register(): Promise<void> {
    if (this.registerForm.invalid) {
      this.showWarningMessage('Por favor, complete todos los campos obligatorios del formulario.')
      return
    }

    this.loading = true

    const {
      email,
      password,
      nombre,
      segundoNombre,
      apellido,
      segundoApellido,
      rut,
      telefono,
      direccion,
      rol,
    } = this.registerForm.value

    const user: User = {
      email,
      nombre,
      segundoNombre,
      apellido,
      segundoApellido,
      rut,
      telefono,
      direccion,
      rol,
    }

    try {
      await this.authService.registerWithEmailAndPassword(email, password, user)
      this.router.navigate(['/login'])
      this.showSuccessMessage('Se ha registrado exitosamente')
    } catch (error) {
      console.error('Error en el registro:', error)
      // @ts-ignore
      if (error.code === 'auth/email-already-in-use') {
        this.showErrorMessage(
          'Un usuario ya se ha registrado con ese correo electrónico. Por favor, intente con otro.'
        )
      } else {
        this.showErrorMessage('Error al registrar usuario')
      }
    } finally {
      this.loading = false
    }
  }

  private showSuccessMessage(message: string): void {
    this.toastr.success(message, 'Éxito')
  }

  private showErrorMessage(message: string): void {
    this.toastr.error(message, 'Error')
  }

  private showWarningMessage(message: string): void {
    this.toastr.warning(message, 'Atención')
  }

  // Métodos para acceder al control del formulario desde el HTML (getters)
  get email() {
    return this.registerForm.get('email')
  }
  get password() {
    return this.registerForm.get('password')
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword')
  }
  get nombre() {
    return this.registerForm.get('nombre')
  }
  get apellido() {
    return this.registerForm.get('apellido')
  }
  get rut() {
    return this.registerForm.get('rut')
  }
  get telefono() {
    return this.registerForm.get('telefono')
  }
}
