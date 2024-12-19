import { Component, OnInit } from '@angular/core'
import { AuthService } from '../../../services/auth-service.service'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import { UserService } from '../../../services/user.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  sidebarClosed = false
  sidebarWidth = 250
  userName?: string
  userLastName?: string
  avatarImg?: string
  showDropdown = false

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userService.userData$.subscribe((userData) => {
      if (userData) {
        this.userName = userData.nombre
        this.userLastName = userData.apellido
        this.avatarImg = userData.avatarImg
      }
    })

    this.loadUserNameAndLastName()
  }

  toggleSidebar(): void {
    this.sidebarClosed = !this.sidebarClosed
    this.sidebarWidth = this.sidebarClosed ? 65 : 250
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown
  }

  logout(): void {
    this.authService.logout()
  }

  loadUserNameAndLastName(): void {
    this.authService.getUserObservable().subscribe((user) => {
      if (user) {
        firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              const userData = {
                nombre: doc.data()?.['nombre'],
                apellido: doc.data()?.['apellido'],
                avatarImg: doc.data()?.['avatarImg'],
              }
              this.userService.setUserData(userData)
            } else {
              console.error('No se encontró el documento del usuario.')
            }
          })
          .catch((error) => {
            console.error('Error al obtener el nombre y apellido del usuario:', error)
          })
      } else {
        console.error('Usuario no autenticado.')
      }
    })
  }
}
