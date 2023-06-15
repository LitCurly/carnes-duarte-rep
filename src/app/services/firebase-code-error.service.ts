import { Injectable } from '@angular/core';
import { FirebaseCodeErrorEnum } from '../utils/firebase-code-error';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCodeErrorService {

  constructor() { }

  codeError(code: string) {
    switch (code) {
      //Correo no ingresado
      case FirebaseCodeErrorEnum.MissingEmail:
        return 'Por favor, introduzca un correo electrónico.';

      //Contraseña no ingresada
      case FirebaseCodeErrorEnum.MissingPassword:
        return 'Por favor, introduzca una contraseña.';

      //El correo ingresado es invalido
      case FirebaseCodeErrorEnum.InvalidEmail:
        return 'Por favor, introduzca un correo electrónico válido.';

      //El correo ya existe en una cuenta
      case FirebaseCodeErrorEnum.EmailAlreadyInUse:
        return 'La cuenta que intenta crear ya existe. Por favor, introduzca un nuevo correo o intente recuperar su contraseña.';

      //La contraseña es demasiado debil
      case FirebaseCodeErrorEnum.WeakPassword:
        return 'La contraseña es demasiado debil. Por favor, introduzca una nueva contraseña con almenos 6 dígitos.';

      //Contraseña incorrecta
      case FirebaseCodeErrorEnum.WrongPassword:
        return 'La contraseña es incorrecta.';
      
      //Usuario no existe
      case FirebaseCodeErrorEnum.UserNotFound:
        return 'El usuario ingresado no existe.';

      default:
        return 'Error desconocido';
    }
  }
}
