import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { User } from '../models/user';

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
          this.userSubject.next(user); // Asegurarse de actualizar userSubject con el usuario obtenido
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

  // Obtener el rol del usuario actual
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
                console.log('Rol del usuario:', userData.rol); // Mensaje de consola agregado
                resolve(userData.rol); // Devolver el rol del usuario
              } else {
                console.error('Usuario no encontrado en Firestore.');
                resolve(null);
              }
            } catch (error) {
              console.error('Error al obtener el rol del usuario:', error);
              reject(error);
            } finally {
              authSubscription.unsubscribe(); // Cancelar la suscripción una vez que se obtiene el rol
            }
          } else {
            resolve(null);
            authSubscription.unsubscribe(); // Cancelar la suscripción si no hay usuario autenticado
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
          const role = await this.getUserRole(); // Obtener el rol del usuario
          console.log('Rol después de iniciar sesión:', role); // Agregar este mensaje de consola
          if (role === 'administrador') {
            this.router.navigate(['/admin/home/dashboard']); // Redirigir a /dashboard si es administrador
          } else {
            this.router.navigate(['/inicio']); // Redirigir a /inicio para otros roles
          }
        }
      });
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
      const userData = {
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
      this.userSubject.next(null); // Limpiar userSubject al cerrar sesión
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
