import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { User } from '../models/user';
import EmailAuthProvider = firebase.auth.EmailAuthProvider;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<firebase.User | null> = new BehaviorSubject<firebase.User | null>(null);
  private isLoggedIn = false;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        this.afAuth.authState.subscribe(user => {
          if (user) {
            this.isLoggedIn = true;
            console.log('Usuario autenticado. ID:', user.uid);
          } else {
            this.isLoggedIn = false;
            console.log('Usuario no autenticado');
          }
          this.userSubject.next(user);
        });
      })
      .catch(error => {
        console.error('Error setting persistence:', error);
      });
  }

  getAuthState(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  getUserObservable(): Observable<firebase.User | null> {
    return this.userSubject.asObservable();
  }

  getUserId(): string | null {
    return this.userSubject.value ? this.userSubject.value.uid : null;
  }

  async getUserRole(): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      const authSubscription = this.afAuth.authState.subscribe({
        next: async (user) => {
          if (user) {
            const uid = user.uid;
            try {
              const userDoc = await firebase.firestore().collection('users').doc(uid).get();
              if (userDoc.exists) {
                const userData = userDoc.data() as User;
                console.log('Rol del usuario:', userData.rol);
                resolve(userData.rol);
              } else {
                console.error('Usuario no encontrado en Firestore.');
                resolve(null);
              }
            } catch (error) {
              console.error('Error al obtener el rol del usuario:', error);
              reject(error);
            } finally {
              authSubscription.unsubscribe();
            }
          } else {
            resolve(null);
            authSubscription.unsubscribe();
          }
        },
        error: (error) => {
          console.error('Error en la suscripción authState:', error);
          reject(error);
        }
      });
    });
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.afAuth.authState.subscribe(async (user) => {
        if (user) {
          const role = await this.getUserRole();
          console.log('Rol después de iniciar sesión:', role);
          if (role === 'administrador' || role === 'superAdmin') {
            this.router.navigate(['/admin/home/dashboard']);
          } else {
            this.router.navigate(['/inicio']);
          }
        }
      });
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
      const userData = {
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

  async changePassword(newPassword: string): Promise<void> {
    const user = firebase.auth().currentUser;
    if (user) {
      try {
        await user.updatePassword(newPassword);
        console.log('Contraseña actualizada correctamente.');
      } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        throw error;
      }
    } else {
      throw new Error('No hay usuario autenticado.');
    }
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  getCurrentUser(): firebase.User | null {
    return this.userSubject.value;
  }

}
