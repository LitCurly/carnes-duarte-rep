import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from './services/auth-service.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Carnes Duarte'
  isLoggedIn = false
  userId: string | null = null

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getAuthState().subscribe((user) => {
      this.isLoggedIn = !!user
      if (user) {
        this.userId = user.uid
        console.log('Usuario autenticado. ID:', this.userId)
      } else {
        this.userId = null
        console.log('Usuario no autenticado')
      }
    })
  }
}
