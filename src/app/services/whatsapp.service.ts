import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  private apiUrl = 'http://localhost:3000/whatsapp/send'; // Reemplaza con la URL de tu backend

  constructor(private http: HttpClient) { }

  enviarBoleta(formData: FormData) {
    return this.http.post<any>(this.apiUrl, formData);
  }
}
