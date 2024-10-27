import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { UserService } from "../../../services/user.service";
import { AuthService } from "../../../services/auth-service.service";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  isLoggedIn = false;
  isLoading = true;
  userName?: string;
  userSecondName?: string;
  userLastName?: string;
  userSecondLastName?: string;
  rut?: string;
  phone?: string;
  address?: string;
  email?: string;
  role?: string;
  avatarImg?: string;

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe(user => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.loadUserNameAndLastName();
      } else {
        this.isLoading = false; // Ocultar spinner si no está autenticado
      }
    });

    this.userService.userData$.subscribe(userData => {
      if (userData) {
        this.userName = userData.nombre;
        this.userSecondName= userData.segundoNombre;
        this.userLastName = userData.apellido;
        this.userSecondLastName = userData.segundoApellido;
        this.rut = userData.rut;
        this.phone = userData.telefono;
        this.address = userData.direccion;
        this.email = userData.email;
        this.role = userData.rol;
        this.avatarImg = userData.avatarImg;
      }
    });

    this.loadUserNameAndLastName();
  }

  formatRutUserData(rut: string | undefined): string {
    if (!rut) return '';
    rut = rut.replace(/\D/g, '');
    const rutFormateado = `${rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${rut.slice(-1)}`;
    return rutFormateado;
  }


  capitalizeFirstLetter(text: string | undefined): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }


  loadUserNameAndLastName(): void {
    this.authService.getUserObservable().subscribe(user => {
      if (user) {
        firebase.firestore().collection('users').doc(user.uid).get()
          .then((doc) => {
            if (doc.exists) {
              const userData = {
                nombre: doc.data()?.['nombre'],
                segundoNombre: doc.data()?.['segundoNombre'],
                apellido: doc.data()?.['apellido'],
                segundoApellido: doc.data()?.['segundoApellido'],
                rut: doc.data()?.['rut'],
                telefono: doc.data()?.['telefono'],
                direccion: doc.data()?.['direccion'],
                email: doc.data()?.['email'],
                rol: doc.data()?.['rol'],
                avatarImg: doc.data()?.['avatarImg']
              };
              this.userService.setUserData(userData);
            } else {
              console.error('No se encontró el documento del usuario.');
            }
          })
          .catch((error) => {
            console.error('Error al obtener el nombre y apellido del usuario:', error);
          });
      } else {
        console.error('Usuario no autenticado.');
      }
    });
  }
}
