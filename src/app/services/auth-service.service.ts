import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Importa AngularFireAuth desde compat/auth
import firebase from 'firebase/compat/app';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  async registerWithEmailAndPassword(email: string, password: string, user: User): Promise<void> {
    try {
      // Registrar usuario en Firebase Authentication
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);

      // Guardar información adicional en Firestore
      await this.createUserProfile(credential.user?.uid, user);
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
      // Agregar el ID de usuario generado automáticamente por Firestore
      const userData: User = {
        ...user,
      };

      // Guardar perfil de usuario en Firestore
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
      // Mostrar mensaje al usuario indicando que se ha enviado un correo para restablecer la contraseña
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
  }
}
