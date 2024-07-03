import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'carnes-duarte';
}

// import { Component, OnInit } from '@angular/core';
// import { AuthService } from './services/auth-service.service';
// import firebase from 'firebase/compat/app';
//
// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit {
//   title = 'Carnes Duarte';
//   constructor(public authService: AuthService) {}
//
//   ngOnInit(): void {
//     this.authService.getAuthState().subscribe((user: firebase.User | null) => {
//       this.authService.isLoggedIn = !!user;
//     });
//   }
// }
