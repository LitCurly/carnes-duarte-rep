import { Component, OnInit } from '@angular/core'
import { AuthService } from '../../services/auth-service.service'
import { UserService } from '../../services/user.service'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

@Component({
  selector: 'header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css'],
})
export class HeaderComponentComponent implements OnInit {
  isLoggedIn = false
  userName?: string
  userLastName?: string
  avatarImg?: string
  showCartModal: boolean = false
  isMobileMenuOpen: boolean = false

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe((user) => {
      this.isLoggedIn = !!user
    })
    this.userService.userData$.subscribe((userData) => {
      if (userData) {
        this.userName = userData.nombre
        this.userLastName = userData.apellido
        this.avatarImg = userData.avatarImg
      }
    })

    this.loadUserNameAndLastName()
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

  logout(): void {
    this.authService.logout()
  }

  openCartModal(): void {
    this.showCartModal = true
  }

  closeCartModal(): void {
    console.log('Cerrar modal')
    this.showCartModal = false
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
  }

  openCartAndToggleMenu() {
    this.openCartModal()
    this.toggleMobileMenu()
  }
}
