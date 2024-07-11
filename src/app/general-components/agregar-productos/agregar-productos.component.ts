import { Component, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CarneService } from '../../services/carne.service';
import {Corte} from "../../models/carne";

@Component({
  selector: 'agregar-productos',
  templateUrl: './agregar-productos.component.html',
  styleUrls: ['./agregar-productos.component.css']
})
export class AgregarProductosComponent {
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  modalOpen: boolean = true;
  tiposCarne = ['cerdo', 'vacuno', 'pollo'];
  opcionesPreparaciones: string[] = ['Cacerola', 'Horno', 'Parrilla', 'Sartén'];
  seleccionTipoCarne: string = '';
  precioTemporal: number | null = null;
  nuevoCorte: Corte = {
    nombre: '',
    precioPorKilo: 0,
    stock: 0,
    preparaciones: [],
    createdAt: new Date()
  };
  isLoading: boolean = false;

  constructor(
    private carneService: CarneService,
    private toastr: ToastrService
  ) {}

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  agregarCorte(): void {
    if (this.validarFormulario() && !this.isLoading) {
      this.isLoading = true;
      if (!this.nuevoCorte.preparaciones) {
        this.nuevoCorte.preparaciones = [];
      }
      this.carneService.agregarCorte(this.seleccionTipoCarne, this.nuevoCorte).then(() => {
        this.resetFormulario();
        this.isLoading = false;
        this.modalOpen = false;
        this.closeModal.emit();
      }).catch(error => {
        this.toastr.error('Error al agregar corte', 'Error');
        console.error('Error adding corte: ', error);
        this.isLoading = false;
      });
    } else {
      this.toastr.error('Por favor, complete todos los campos correctamente', 'Error');
    }
  }

  validarFormulario(): boolean {
    return this.seleccionTipoCarne !== '' &&
      ((this.nuevoCorte.preparaciones !== undefined && this.nuevoCorte.preparaciones.length > 0) ||
        (this.nuevoCorte.preparaciones === undefined || this.nuevoCorte.preparaciones.length === 0)) &&
      this.nuevoCorte.precioPorKilo > 0;
  }

  resetFormulario(): void {
    this.nuevoCorte = {
      nombre: '',
      precioPorKilo: 0,
      stock: 0,
      preparaciones: [],
      createdAt: new Date()
    };
    this.seleccionTipoCarne = '';
  }

  togglePreparacion(preparacion: string): void {
    const index = this.nuevoCorte.preparaciones?.indexOf(preparacion) ?? -1;
    if (index !== -1) {
      this.nuevoCorte.preparaciones?.splice(index, 1);
    } else {
      this.nuevoCorte.preparaciones?.push(preparacion);
    }
  }

  clearPrice(): void {
    if (this.nuevoCorte.precioPorKilo === 0) {
      this.precioTemporal = this.nuevoCorte.precioPorKilo;
      this.nuevoCorte.precioPorKilo = NaN;
    }
  }

  restorePrice(): void {
    if (isNaN(this.nuevoCorte.precioPorKilo)) {
      this.nuevoCorte.precioPorKilo = this.precioTemporal ?? 0;
      this.precioTemporal = null;
    }
  }

  closeModalDialog() {
    this.modalOpen = false;
    this.closeModal.emit(); // Emite el evento para cerrar el modal
  }
}
