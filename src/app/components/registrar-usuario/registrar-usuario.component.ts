import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.component.html',
  styleUrls: ['./registrar-usuario.component.css']
})
export class RegistrarUsuarioComponent implements OnInit {
  registrarUsuario: FormGroup;

  constructor(private fb: FormBuilder){
    this.registrarUsuario = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      direccion: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      repetirPassword: ['', Validators.required],
    },
    { validator: this.passwordMatchValidator }
    );

    // Suscribirse a los cambios en el formulario
  this.registrarUsuario.valueChanges
  .pipe(debounceTime(300))
  .subscribe(() => {
    this.registrarUsuario.updateValueAndValidity();
  });
  }

  ngOnInit(): void {
  }

  registrar(){
    const nombre = this.registrarUsuario.value.nombre;
    const telefono = this.registrarUsuario.value.telefono;
    const direccion = this.registrarUsuario.value.direccion;
    const email = this.registrarUsuario.value.email;
    const password = this.registrarUsuario.value.password;
    const repetirPassword = this.registrarUsuario.value.repetirPassword;
    console.log(nombre, telefono, direccion, email, password, repetirPassword);
  }

  // Validador personalizado para verificar si las contraseñas coinciden
  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const repetirPassword = control.get('repetirPassword');

    if (password && repetirPassword && password.value !== repetirPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

}
