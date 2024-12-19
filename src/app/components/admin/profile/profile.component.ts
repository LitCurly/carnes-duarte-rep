import { Component, OnInit } from '@angular/core'
import { AuthService } from '../../../services/auth-service.service'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  nombre?: string
  segundoNombre?: string
  apellido?: string
  segundoApellido?: string
  rut?: string
  telefono?: string
  direccion?: string
  email?: string
  rol?: string
  avatarImg?: string

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadDataUser()
  }

  formatRutUserData(rut: string): string {
    if (!rut) return ''
    rut = rut.replace(/\D/g, '')
    const rutFormateado = `${rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${rut.slice(-1)}`
    return rutFormateado
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  loadDataUser(): void {
    this.authService.getUserObservable().subscribe((user) => {
      if (user) {
        firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              this.nombre = doc.data()?.['nombre']
              this.segundoNombre = doc.data()?.['segundoNombre']
              this.apellido = doc.data()?.['apellido']
              this.segundoApellido = doc.data()?.['segundoApellido']
              this.rut = this.formatRutUserData(doc.data()?.['rut'])
              this.telefono = doc.data()?.['telefono']
              this.direccion = doc.data()?.['direccion']
              this.email = doc.data()?.['email']
              this.rol = this.capitalizeFirstLetter(doc.data()?.['rol'])
              this.avatarImg = doc.data()?.['avatarImg']
            } else {
              console.error('No se encontró el documento del usuario.')
            }
          })
          .catch((error) => {
            console.error('Error al obtener los dat del usuario:', error)
          })
      } else {
        console.error('Usuario no autenticado.')
      }
    })
  }
}
