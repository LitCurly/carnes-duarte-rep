export interface User {
  nombre: string;
  segundoNombre?: string; // Opcional
  apellido: string;
  segundoApellido?: string; // Opcional
  rut: string;
  telefono: string;
  direccion?: string; //Opciona
  email: string; // Correo electrónico del usuario
  rol: 'administrador' | 'usuario';
}
