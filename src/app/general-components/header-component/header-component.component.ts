import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})
export class HeaderComponentComponent implements OnInit {
  isLoggedIn = false;
  showCartModal: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  openCartModal(): void {
    this.showCartModal = true;
  }

  closeCartModal(): void {
    console.log('Cerrar modal');
    this.showCartModal = false;
  }
}
