import { Injectable } from '@angular/core';
import {Firestore, collectionData, collection, doc, deleteDoc, updateDoc} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {AuthService} from "./auth-service.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private afAuth: AngularFireAuth,

    private authService: AuthService
  ) { }

  setUserData(userData: any): void {
    this.userDataSubject.next(userData);
  }


  getUsers(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' }) as Observable<any[]>;
  }

  updateUserRole(userId: string, newRole: string): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return new Observable<void>((observer) => {
      updateDoc(userDocRef, { rol: newRole }).then(() => {
        observer.next();
        observer.complete();
      }).catch((error) => {
        observer.error(error);
      });
    });
  }
}
