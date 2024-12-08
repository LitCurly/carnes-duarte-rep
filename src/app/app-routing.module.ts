import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { ProductosComponent } from './components/productos/productos.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
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
import { AuthGuard } from "./services/auth.guard";
import { DashboardComponent } from "./components/admin/dashboard/dashboard.component";
import { HomeComponent } from "./components/admin/home/home.component";
import { ProfileComponent } from "./components/admin/profile/profile.component";
import { EditComponent } from "./components/admin/profile/edit/edit.component";
import { ChangePasswordComponent } from "./general-components/change-password/change-password.component";
import { AgregarProductosComponent } from "./general-components/agregar-productos/agregar-productos.component";
import { HomeUserComponent } from "./components/user/home-user/home-user.component";
import {UserProfileComponent} from "./components/user/user-profile/user-profile.component";
import {UserEditComponent} from "./components/user/user-edit/user-edit.component";
import {EditarProductosComponent} from "./general-components/editar-productos/editar-productos.component";

const routes: Routes = [
  { path: '', redirectTo: 'home/inicio', pathMatch: 'full' },
  { path: 'admin/ver-pedidos', component: VerPedidosComponent },
  { path: 'admin/gestionar-productos', component: GestionarProductosComponent },
  { path: 'admin/gestionar-usuarios', component: GestionarUsuariosComponent },

  // Componentes Generales
  { path: 'footer-component', component: FooterComponentComponent },
  { path: 'header-component', component: HeaderComponentComponent },
  { path: 'carrito', component: CartComponent },
  { path: 'order', component: OrderComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrarse', component: RegisterComponent },
  { path: 'recuperar-contraseña', component: ForgotPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent },

  {
    path: 'home',
    component: HomeUserComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent},
      { path: 'productos', component: ProductosComponent },
      { path: 'productos/pollo', component: PolloComponent },
      { path: 'productos/vacuno', component: VacunoComponent },
      { path: 'productos/cerdo', component: CerdoComponent },
      { path: 'mis-pedidos', component: MisPedidosComponent},
      { path: 'mis-pedidos/:id/detalle-del-pedido', component: OrderDetailComponent },
      { path: 'sobre-nosotros', component: SobreNosotrosComponent },
      { path: 'perfil', component: UserProfileComponent },
      { path: 'perfil/editar', component: UserEditComponent },
    ]
  },
  // Admin Routes
  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'dashboard', component: DashboardComponent },
          { path: 'gestionar-productos', component: GestionarProductosComponent, children: [
              { path: 'agregar-productos', component: AgregarProductosComponent },
            ] },
          { path: 'gestionar-productos/:tipoCarne/:corteId/editar-productos', component: EditarProductosComponent },
          { path: 'gestionar-usuarios', component: GestionarUsuariosComponent},
          { path: 'revisar-ordenes-de-compra', component: VerPedidosComponent },
          { path: 'profile', component: ProfileComponent },
          { path: 'profile/edit', component: EditComponent },

        ]
      }
    ]
  },
  { path: '**', redirectTo: 'home/inicio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
