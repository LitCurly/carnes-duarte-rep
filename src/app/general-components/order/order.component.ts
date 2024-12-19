import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { CartService } from '../../services/cart.service'
import { Order } from '../../models/order'
import { AuthService } from '../../services/auth-service.service'
import { map } from 'rxjs/operators'

@Component({
  selector: 'order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit {
  orders: Order[] = []
  paginatedOrders: Order[] = []
  currentPage: number = 1
  itemsPerPage: number = 10
  totalPages: number = 1
  isLoggedIn = false
  isLoading = true

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe((user) => {
      this.isLoggedIn = !!user
      if (this.isLoggedIn) {
        this.loadOrders()
      } else {
        this.isLoading = false
      }
    })
  }

  loadOrders(): void {
    this.isLoading = true
    this.cartService
      .getAllOrders()
      .pipe(
        map((orders: Order[]) => {
          return orders.sort((a, b) => {
            return b.createdAt.getTime() - a.createdAt.getTime()
          })
        })
      )
      .subscribe(
        (sortedOrders: Order[]) => {
          this.orders = sortedOrders
          this.totalPages = Math.ceil(this.orders.length / this.itemsPerPage)
          this.paginateOrders()
          this.isLoading = false
        },
        (error) => {
          console.error('Error loading orders:', error)
          this.isLoading = false
        }
      )
  }

  paginateOrders(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    this.paginatedOrders = this.orders.slice(start, end)
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.paginateOrders()
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
      this.paginateOrders()
    }
  }

  getCorteNames(order: Order): string {
    return order.items.map((item) => item.nombre).join(', ')
  }

  getShortCorteNames(order: Order): string {
    const nombres = order.items.map((item) => item.nombre)
    if (nombres.length <= 3) {
      return nombres.join(', ')
    }
    return nombres.slice(0, 3).join(', ') + '...'
  }

  formatDate(dateTime: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    return dateTime.toLocaleDateString('es-ES', options)
  }

  formatTime(dateTime: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
    }
    return dateTime.toLocaleTimeString('es-ES', options)
  }
}
