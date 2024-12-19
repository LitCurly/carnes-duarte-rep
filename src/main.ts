import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'
import { environment } from './environments/environment'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/storage'
import { enableProdMode } from '@angular/core'

if (environment.production) {
  enableProdMode()
}

firebase.initializeApp(environment.firebaseConfig)

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err))
