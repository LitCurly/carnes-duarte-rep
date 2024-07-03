import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<firebase.User | null> = new BehaviorSubject<firebase.User | null>(null);
  user$: Observable<firebase.User | null> = this.userSubject.asObservable();
  isLoggedIn = false;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
      this.afAuth.authState.subscribe(user => {
        this.isLoggedIn = !!user;
        this.userSubject.next(user);
      });
    }).catch(error => {
      console.error('Error setting persistence:', error);
    });
  }

  getAuthState(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

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

  async resetPassword(email: string): Promise<void> {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      console.log('Correo de recuperación enviado correctamente.');
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
  }

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
}
