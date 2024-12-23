import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Order } from '../../models/order'
import { CartService } from '../../services/cart.service'
import { AuthService } from '../../services/auth-service.service'
import { ToastrService } from 'ngx-toastr'
import firebase from 'firebase/compat/app'
import 'firebase/compat/storage'
import 'firebase/compat/firestore'

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
})
export class OrderDetailComponent implements OnInit {
  order: Order | undefined
  orderId: string | null = null
  loading: boolean = false
  organization: any = {}
  userRut: string | undefined
  nombre?: string | undefined
  apellido?: string
  telefono?: string
  direccion?: string
  email?: string
  isLoggedIn = false
  isLoading = true

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id')
    if (this.orderId) {
      this.isLoading = true
      this.cartService.getOrderById(this.orderId).subscribe((order) => {
        console.log('Order data:', order)
        this.order = order
        if (order) {
          this.loadOrganizationData()
        }
        this.isLoading = false // Cambiar a false una vez que los datos estén listos
      })
      this.loadUserRut()
    } else {
      this.toastr.error('No se encontró la orden.')
    }
    this.authService.getUserObservable().subscribe((user) => {
      this.isLoggedIn = !!user
      if (!this.isLoggedIn) {
        this.isLoading = false
      }
    })
  }

  loadOrganizationData(): void {
    firebase
      .firestore()
      .collection('organizaciones')
      .doc('zB4puD5MYCekNH38PIVr')
      .get()
      .then((doc) => {
        if (doc.exists) {
          this.organization = doc.data()
          console.log('Datos de la organización:', this.organization)
        } else {
          console.error('No se encontró el documento de la organización.')
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos de la organización:', error)
      })
  }

  loadUserRut(): void {
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
              this.apellido = doc.data()?.['apellido']
              this.telefono = doc.data()?.['telefono']
              this.direccion = doc.data()?.['direccion']
              this.email = doc.data()?.['email']
              this.userRut = doc.data()?.['rut']
              console.log('RUT del usuario:', this.userRut)
            } else {
              console.error('No se encontró el documento del usuario.')
            }
          })
          .catch((error) => {
            console.error('Error al obtener el RUT del usuario:', error)
          })
      } else {
        console.error('Usuario no autenticado.')
      }
    })
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString()
  }

  formatTime(date: any): string {
    return new Date(date).toLocaleTimeString()
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
}
