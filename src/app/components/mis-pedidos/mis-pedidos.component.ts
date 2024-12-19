import { Component } from '@angular/core'
import { AuthService } from '../../services/auth-service.service'

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css'],
})
export class MisPedidosComponent {
  isLoggedIn = false
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe((user) => {
      this.isLoggedIn = !!user
    })
  }
}
