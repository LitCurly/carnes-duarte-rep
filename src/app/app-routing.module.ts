import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario.component';
import { VerificarCorreoComponent } from './components/verificar-correo/verificar-correo.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { ProductosComponent } from './components/productos/productos.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { MisDatosComponent } from './components/mis-datos/mis-datos.component';
import { SobreNosotrosComponent } from './components/sobre-nosotros/sobre-nosotros.component';
import { VerPedidosComponent } from './components/admin/ver-pedidos/ver-pedidos.component';
import { GestionarProductosComponent } from './components/admin/gestionar-productos/gestionar-productos.component';
import { GestionarUsuariosComponent } from './components/admin/gestionar-usuarios/gestionar-usuarios.component';
import { PolloComponent } from './components/productos/pollo/pollo.component';
import { CerdoComponent } from './components/productos/cerdo/cerdo.component';
import { VacunoComponent } from './components/productos/vacuno/vacuno.component';
import { FooterComponentComponent } from "./general-components/footer-component/footer-component.component";
import { HeaderComponentComponent } from "./general-components/header-component/header-component.component";
import { CartComponent } from "./general-components/cart/cart.component";
import { OrderComponent} from "./general-components/order/order.component";
import { OrderDetailComponent } from "./general-components/order-detail/order-detail.component";
import { LoginComponent } from "./general-components/login/login.component";
import { RegisterComponent } from "./general-components/register/register.component";
import { ForgotPasswordComponent } from "./general-components/forgot-password/forgot-password.component";

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent},
  { path: 'registrar-usuario', component: RegistrarUsuarioComponent },
  { path: 'verificar-correo', component: VerificarCorreoComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'productos/pollo', component: PolloComponent },
  { path: 'productos/vacuno', component: VacunoComponent },
  { path: 'productos/cerdo', component: CerdoComponent },
  { path: 'mis-pedidos', component: MisPedidosComponent },
  { path: 'mis-pedidos/:id/order-detail', component: OrderDetailComponent },
  { path: 'mis-datos', component: MisDatosComponent },
  { path: 'sobre-nosotros', component: SobreNosotrosComponent },
  { path: 'admin/ver-pedidos', component: VerPedidosComponent },
  { path: 'admin/gestionar-productos', component: GestionarProductosComponent },
  { path: 'admin/gestionar-usuarios', component: GestionarUsuariosComponent },
  { path: 'dashboard', component: DashboardComponent },

  // Componentes Generales
  { path: 'footer-component', component: FooterComponentComponent },
  { path: 'header-component', component: HeaderComponentComponent },
  { path: 'carrito', component: CartComponent },
  { path: 'order', component: OrderComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrarse', component: RegisterComponent },
  { path: 'recuperar-contraseña', component: ForgotPasswordComponent },

  { path: '**', redirectTo: 'inicio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
