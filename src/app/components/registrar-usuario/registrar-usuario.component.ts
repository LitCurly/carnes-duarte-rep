import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FirebaseCodeErrorService } from 'src/app/services/firebase-code-error.service';

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.component.html',
  styleUrls: ['./registrar-usuario.component.css'],
})
export class RegistrarUsuarioComponent implements OnInit {
  registrarUsuario: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private router: Router,
    private firebaseError: FirebaseCodeErrorService
  ) {
    this.registrarUsuario = this.fb.group(
      {
        nombre: ['', Validators.required],
        telefono: [
          '',
          [
            Validators.required,
            Validators.pattern('[0-9]+'),
            this.validarTelefono,
          ],
        ],
        direccion: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        repetirPassword: ['', Validators.required],
      },
      //{ validator: this.passwordMatchValidator }
    );

    // Suscribirse a los cambios en el formulario
    this.registrarUsuario.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.registrarUsuario.updateValueAndValidity();
    });
  }

  ngOnInit(): void {}

  registrar() {
    const nombre = this.registrarUsuario.value.nombre;
    const telefono = this.registrarUsuario.value.telefono;
    const direccion = this.registrarUsuario.value.direccion;
    const email = this.registrarUsuario.value.email;
    const password = this.registrarUsuario.value.password;
    const repetirPassword = this.registrarUsuario.value.repetirPassword;

    console.log(this.registrarUsuario);

    //Validaciones
    if (nombre.length == 0) {
      this.toastr.error('Es necesario que introduzca su nombre', 'Error');
      return;
    }

    if (telefono.length == 0) {
      this.toastr.error('Es necesario que introduzca su teléfono', 'Error');
      return;
    }else {
      if (telefono && isNaN(telefono)) {
        this.toastr.error('El número de teléfono solo debe poseer digitos numericos', 'Error');
        return;
      }else {
        if (telefono && telefono.length != 8) {
          this.toastr.error('El número de teléfono debe poseer 8 dígitos', 'Error');
          return;
        }
      }
    }
    
    if (direccion.length == 0) {
      this.toastr.error('Es necesario que introduzca su dirección', 'Error');
      return;
    }

    if (email.length == 0) {
      this.toastr.error('Es necesario que introduzca su correo electrónico', 'Error');
      return;
    }

    if (password.length == 0) {
      this.toastr.error('Es necesario que introduzca una contraseña', 'Error');
      return;
    }else {
      if (password != repetirPassword) {
        this.toastr.error(
          'Las contraseñas no coinciden, intentelo nuevamente.',
          'Error'
        );
        return;
      }
    }

    this.loading = true;
      
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((user) => {
        this.loading = false;
        this.toastr.success('Su cuenta a sido registrada con exito!', 'Usuario registrado');
        // this.router.navigate(['/login']);
         console.log(user);
        this.verificarCorreo();
      })
      .catch((error) => {
        this.loading = false;
        this.toastr.error(this.firebaseError.codeError(error.code), 'Error');
        console.log(error);
      });
  }

  //Verificar correo
  verificarCorreo(){
    this.afAuth.currentUser.then(user => user?.sendEmailVerification())
    .then(() => {
      this.loading = false;
      this.toastr.info(
        'Le enviamos un correo electrónico para verificar su cuenta, revise la sección de "Spam" de ser necesario',
        'Verificación Pendiente'
      );
      this.router.navigate(['/login']);
    });
  }

  // Validador personalizado para verificar si las contraseñas coinciden
  // passwordMatchValidator(
  //   control: AbstractControl
  // ): { [key: string]: any } | null {
  //   const password = control.get('password');
  //   const repetirPassword = control.get('repetirPassword');

  //   if (
  //     password &&
  //     repetirPassword &&
  //     password.value !== repetirPassword.value
  //   ) {
  //     return { passwordMismatch: true };
  //   }

  //   return null;
  // }

  // Validar telefono
  validarTelefono(control: AbstractControl): { [key: string]: any } | null {
    const telefono = control.value;
    if (telefono && telefono.length !== 8) {
      return { telefonoInvalido: true };
    }
    return null;
  }


}
