export interface User {
  nombre: string
  segundoNombre?: string
  apellido: string
  segundoApellido?: string
  rut: string
  telefono: string
  direccion?: string
  email: string
  rol: 'administrador' | 'usuario' | 'superAdmin'
  avatarImg?: string
}
