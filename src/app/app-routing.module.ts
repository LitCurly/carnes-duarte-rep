import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario.component';
import { VerificarCorreoComponent } from './components/verificar-correo/verificar-correo.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { ProductosComponent } from './components/productos/productos.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { MisDatosComponent } from './components/mis-datos/mis-datos.component';
import { SobreNosotrosComponent } from './components/sobre-nosotros/sobre-nosotros.component';
import { VerPedidosComponent } from './components/admin/ver-pedidos/ver-pedidos.component';
import { GestionarProductosComponent } from './components/admin/gestionar-productos/gestionar-productos.component';
import { GestionarUsuariosComponent } from './components/admin/gestionar-usuarios/gestionar-usuarios.component';
import { PolloComponent } from './components/productos/pollo/pollo.component';
import { CerdoComponent } from './components/productos/cerdo/cerdo.component';
import { VacunoComponent } from './components/productos/vacuno/vacuno.component';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrar-usuario', component: RegistrarUsuarioComponent },
  { path: 'verificar-correo', component: VerificarCorreoComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'productos/pollo', component: PolloComponent },
  { path: 'productos/vacuno', component: VacunoComponent },
  { path: 'productos/cerdo', component: CerdoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'mis-pedidos', component: MisPedidosComponent },
  { path: 'mis-datos', component: MisDatosComponent },
  { path: 'sobre-nosotros', component: SobreNosotrosComponent },
  { path: 'admin/ver-pedidos', component: VerPedidosComponent },
  { path: 'admin/gestionar-productos', component: GestionarProductosComponent },
  { path: 'admin/gestionar-usuarios', component: GestionarUsuariosComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'inicio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
