import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//Modulos
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { MatTooltipModule } from '@angular/material/tooltip';

//Componentes
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario.component';
import { VerificarCorreoComponent } from './components/verificar-correo/verificar-correo.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { environment } from 'src/environments/environment';
import { InicioComponent } from './components/inicio/inicio.component';
import { GestionarUsuariosComponent } from './components/admin/gestionar-usuarios/gestionar-usuarios.component';
import { GestionarProductosComponent } from './components/admin/gestionar-productos/gestionar-productos.component';
import { VerPedidosComponent } from './components/admin/ver-pedidos/ver-pedidos.component';
import { ProductosComponent } from './components/productos/productos.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { MisDatosComponent } from './components/mis-datos/mis-datos.component';
import { SobreNosotrosComponent } from './components/sobre-nosotros/sobre-nosotros.component';
import { PolloComponent } from './components/productos/pollo/pollo.component';
import { CerdoComponent } from './components/productos/cerdo/cerdo.component';
import { VacunoComponent } from './components/productos/vacuno/vacuno.component';
import { FooterComponentComponent } from './general-components/footer-component/footer-component.component';
import { HeaderComponentComponent } from './general-components/header-component/header-component.component';
import { BoxComponent } from './general-components/box/box.component';
import { CartComponent } from './general-components/cart/cart.component';
import { OrderComponent } from "./general-components/order/order.component";
import { OrderDetailComponent } from './general-components/order-detail/order-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    RegistrarUsuarioComponent,
    VerificarCorreoComponent,
    RecuperarPasswordComponent,
    SpinnerComponent,
    InicioComponent,
    GestionarUsuariosComponent,
    GestionarProductosComponent,
    VerPedidosComponent,
    ProductosComponent,
    MisPedidosComponent,
    MisDatosComponent,
    SobreNosotrosComponent,
    PolloComponent,
    CerdoComponent,
    VacunoComponent,
    FooterComponentComponent,
    HeaderComponentComponent,
    BoxComponent,
    CartComponent,
    OrderComponent,
    OrderDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FormsModule,
    MatTooltipModule,
  ],
  providers: [CartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
