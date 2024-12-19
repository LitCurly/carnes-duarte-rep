import { Component, EventEmitter, Output } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '../../services/auth-service.service'
import { Router } from '@angular/router'

@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent {
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>()

  newPassword: string = ''
  confirmPassword: string = ''
  modalOpen: boolean = true
  showSpinner: boolean = false

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) {}

  closeModalDialog() {
    this.modalOpen = false
    this.closeModal.emit()
  }

  changePassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.toastr.error('Por favor, complete los campos sin rellenar.')
      return
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Las contraseñas no coinciden. Por favor, inténtelo de nuevo.')
      return
    }

    this.showSpinner = true
    this.authService
      .changePassword(this.newPassword)
      .then(() => {
        this.showSpinner = false
        this.toastr.success('La contraseña ha sido actualizada con éxito.')
        this.closeModalDialog()
      })
      .catch((error) => {
        this.showSpinner = false
        console.error('Error al actualizar la contraseña:', error)
        this.toastr.error('Error al actualizar la contraseña. Por favor, inténtelo de nuevo.')
      })
  }
}
