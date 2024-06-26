import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Importa Firebase y los servicios que necesitas
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

// Configura tu aplicación Firebase
firebase.initializeApp(environment.firebaseConfig);

// Inicia la aplicación Angular después de configurar Firebase
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
