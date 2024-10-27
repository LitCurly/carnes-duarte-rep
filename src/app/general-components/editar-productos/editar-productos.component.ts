import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarneService } from '../../services/carne.service';
import { Corte } from '../../models/carne';
import { ToastrService } from 'ngx-toastr';
import {take} from "rxjs";

@Component({
  selector: 'editar-productos',
  templateUrl: './editar-productos.component.html',
  styleUrls: ['./editar-productos.component.css']
})
export class EditarProductosComponent implements OnInit {
  tipoCarne: string = '';
  corteId: string = '';
  corte: Corte = {
    nombre: '',
    precioPorKilo: 0,
    stock: 0,
    preparaciones: [],
  };
  isLoading: boolean = false;

  opcionesPreparaciones: string[] = ['Cacerola', 'Horno', 'Parrilla', 'Sartén'];

  constructor(
    private carneService: CarneService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tipoCarne = params['tipoCarne'];
      this.corteId = params['corteId'];

      this.getCorteDetails();
    });
  }

  getCorteDetails(): void {
    this.carneService.getCarneCortes(this.tipoCarne).pipe(take(1)).subscribe(carne => {
      if (!carne) {
        carne = { tipo: this.tipoCarne, cortes: [] };
      }

      if (carne.cortes) {
        const corteEncontrado = carne.cortes.find(corte => corte.nombre === this.corteId);
        if (corteEncontrado) {
          this.corte = corteEncontrado;
        } else {
          this.toastr.error('Corte no encontrado', 'Error');
        }
      } else {
        this.toastr.error('No se encontraron cortes para este tipo de carne', 'Error');
      }
    });
  }

  actualizarCorte(): void {
    if (this.validarFormulario()) {
      this.carneService.actualizarCorte(this.tipoCarne, this.corteId, this.corte)
        .then(() => {
          this.toastr.success('Corte actualizado correctamente', 'Éxito');
          this.router.navigate([`/admin/home/gestionar-productos`]);
        })
        .catch((error: any) => {
          this.toastr.error('Error al actualizar el corte', 'Error');

        });
    } else {
      this.toastr.warning('Por favor, complete todos los campos correctamente', 'Advertencia');
    }
  }

  validarFormulario(): boolean {
    return this.corte.nombre !== '' &&
      this.corte.precioPorKilo > 0 &&
      this.corte.stock >= 0;
  }

  togglePreparacion(preparacion: string): void {
    const index = this.corte.preparaciones?.indexOf(preparacion) ?? -1;
    if (index !== -1) {
      this.corte.preparaciones?.splice(index, 1);
    } else {
      this.corte.preparaciones?.push(preparacion);
    }
  }
}
