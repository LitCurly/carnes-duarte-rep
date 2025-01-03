import { Component, OnInit } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'
import { AuthService } from '../../../services/auth-service.service'
import { UserService } from '../../../services/user.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  isLoggedIn = false
  isLoading = true
  nombre?: string
  segundoNombre?: string
  apellido?: string
  segundoApellido?: string
  rut?: string
  telefono?: string
  direccion?: string
  email?: string
  rol?: string
  avatarImg?: string
  showChangePasswordModal: boolean = false
  savingData: boolean = false
  userId?: string

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe((user) => {
      this.isLoggedIn = !!user
      if (this.isLoggedIn) {
        this.userId = user?.uid
        this.loadDataUser()
      } else {
        this.isLoading = false
      }
      this.isLoading = false
    })
  }

  loadDataUser(): void {
    if (!this.userId) {
      console.error('No se pudo cargar el UID del usuario.')
      return
    }

    console.log(`Cargando datos para el usuario con UID: ${this.userId}`)

    firebase
      .firestore()
      .collection('users')
      .doc(this.userId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data() || {}
          this.nombre = data['nombre'] || ''
          this.segundoNombre = data['segundoNombre'] || ''
          this.apellido = data['apellido'] || ''
          this.segundoApellido = data['segundoApellido'] || ''
          this.rut = this.formatRutUserData(data['rut'] || '')
          this.telefono = data['telefono'] || ''
          this.direccion = data['direccion'] || ''
          this.email = data['email'] || ''
          this.rol = this.capitalizeFirstLetter(data['rol'] || '')
          this.avatarImg = data['avatarImg'] || ''

          const userData = {
            nombre: this.nombre,
            segundoNombre: this.segundoNombre,
            apellido: this.apellido,
            segundoApellido: this.segundoApellido,
            rut: this.rut,
            telefono: this.telefono,
            direccion: this.direccion,
            email: this.email,
            rol: this.rol,
            avatarImg: this.avatarImg,
          }
          this.userService.setUserData(userData)
        } else {
          console.error('No se encontró el documento del usuario.')
        }
      })
      .catch((error) => {
        console.error('Error al obtener los datos del usuario:', error)
      })
  }

  formatRutUserData(rut: string): string {
    if (!rut) return ''
    rut = rut.replace(/\D/g, '')
    const rutFormateado = `${rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${rut.slice(-1)}`
    return rutFormateado
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  openPasswordModal(): void {
    this.showChangePasswordModal = true
  }

  closePasswordModal(): void {
    this.showChangePasswordModal = false
  }

  saveUserData(): void {
    if (!this.userId) {
      console.error('No se pudo cargar el UID del usuario.')
      return
    }

    this.savingData = true
    console.log(`Guardando datos para el usuario con UID: ${this.userId}`)

    const updateData = {
      nombre: this.nombre,
      segundoNombre: this.segundoNombre,
      apellido: this.apellido,
      segundoApellido: this.segundoApellido,
      telefono: this.telefono,
      direccion: this.direccion,
      avatarImg: this.avatarImg,
      rut: this.rut ? this.rut.replace(/\./g, '').replace(/-/g, '') : this.rut, // Eliminar el formato del RUT antes de guardar
    }

    firebase
      .firestore()
      .collection('users')
      .doc(this.userId)
      .update(updateData)
      .then(() => {
        this.toastr.success('Información del usuario actualizada con éxito.')

        const userData = {
          nombre: this.nombre,
          segundoNombre: this.segundoNombre,
          apellido: this.apellido,
          segundoApellido: this.segundoApellido,
          rut: this.rut,
          telefono: this.telefono,
          direccion: this.direccion,
          email: this.email,
          rol: this.rol,
          avatarImg: this.avatarImg,
        }
        this.userService.setUserData(userData)
        this.router.navigate(['/home/perfil'])
      })
      .catch((error) => {
        this.toastr.error('Error al actualizar la información del usuario. Por favor, inténtelo de nuevo.')
      })
      .finally(() => {
        this.savingData = false
      })
  }

  openFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0]
    if (file) {
      this.uploadImage(file)
    }
  }

  uploadImage(file: File): void {
    const storageRef = firebase.storage().ref()
    const uploadTask = storageRef.child(`avatars/${this.userId}/${file.name}`).put(file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {},
      (error) => {
        this.toastr.error('Hubo un error al cargar la imagen.')
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.updateAvatarURL(downloadURL)
        })
      }
    )
  }

  updateAvatarURL(downloadURL: string): void {
    if (!this.userId) return

    firebase
      .firestore()
      .collection('users')
      .doc(this.userId)
      .update({
        avatarImg: downloadURL,
      })
      .then(() => {
        this.toastr.success('Foto actualizada correctamente')
        this.avatarImg = downloadURL
        location.reload()
      })
      .catch((error) => {
        this.toastr.error('Hubo un error al actualizar la foto.')
      })
  }

  onRutInput(event: any): void {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')

    if (value.length > 9) {
      value = value.slice(0, 9)
    }

    if (value.length > 3 && value.length <= 6) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`
    } else if (value.length > 6 && value.length <= 8) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
    } else if (value.length === 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 8)}-${value.slice(8, 9)}`
    }

    this.rut = value
  }
}
