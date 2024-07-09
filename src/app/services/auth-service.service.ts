import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<firebase.User | null> = new BehaviorSubject<firebase.User | null>(null);
  private isLoggedIn = false;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    // Configurar persistencia de autenticación local
    this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        // Suscribirse al estado de autenticación
        this.afAuth.authState.subscribe(user => {
          if (user) {
            this.isLoggedIn = true;
          } else {
            this.isLoggedIn = false;
          }
          this.userSubject.next(user);
        });
      })
      .catch(error => {
        console.error('Error setting persistence:', error);
      });
  }

  // Obtener el estado de autenticación observable
  getAuthState(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  // Obtener el userSubject como observable público
  getUserObservable(): Observable<firebase.User | null> {
    return this.userSubject.asObservable();
  }

  // Obtener el ID de usuario actual
  getUserId(): string | null {
    return this.userSubject.value ? this.userSubject.value.uid : null;
  }

  // Iniciar sesión con correo y contraseña
  async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.isLoggedIn = true;
      this.router.navigate(['/inicio']);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // Registrar un nuevo usuario con correo y contraseña
  async registerWithEmailAndPassword(email: string, password: string, user: User): Promise<void> {
    try {
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      await this.createUserProfile(credential.user?.uid, user);
      this.isLoggedIn = true;
      this.router.navigate(['/inicio']);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Crear perfil de usuario en Firestore
  private async createUserProfile(uid: string | undefined, user: User): Promise<void> {
    if (!uid) {
      throw new Error('ID de usuario no válido.');
    }

    try {
      const userData: User = {
        ...user,
      };

      await firebase.firestore().collection('users').doc(uid).set(userData);
    } catch (error) {
      console.error('Error al crear perfil de usuario en Firestore:', error);
      throw error;
    }
  }

  // Enviar correo de recuperación de contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      console.log('Correo de recuperación enviado correctamente.');
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      this.isLoggedIn = false;
      this.userSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Comprobar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
}
