import { Component, OnInit} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FirebaseCodeErrorService } from 'src/app/services/firebase-code-error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginUsuario: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private router: Router,
    private firebaseError: FirebaseCodeErrorService
  ) {
    this.loginUsuario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })
  }

  ngOnInit(): void {
  }

  login(){
    const email = this.loginUsuario.value.email;
    const password = this.loginUsuario.value.password;
    
    if (email.length == 0) {
      this.toastr.error('Es necesario que introduzca su correo electrónico', 'Error');
      return;
    }

    if (password.length == 0) {
      this.toastr.error('Es necesario que introduzca una contraseña', 'Error');
      return;
    }

    this.loading = true;
    this.afAuth.signInWithEmailAndPassword(email, password).then ((user) => {
      this.loading = false;
      if(user.user?.emailVerified){
        this.toastr.success('Usted a iniciado sesión con exito!', 'Ingresado Correctamente');
        this.router.navigate(['/dashboard']);
        console.log(user);
      } else{
        this.afAuth.currentUser.then(user => user?.sendEmailVerification())
        this.toastr.info('Usted debe verificar su correo para poder iniciar sesión, le enviamos nuevamente un correo de verificación, revise la sección de "Spam" de ser necesario', 'Verificación Pendiente');
        this.router.navigate(['/verificar-correo']);
        console.log(user);
      }
      console.log(user);
    }).catch((error) => {
      this.loading = false;
      this.toastr.error(this.firebaseError.codeError(error.code), 'Error');
    })
  }
}
