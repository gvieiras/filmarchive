import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { FilmsService } from './components/films/films.service';
import { AppRoutingModule } from './app-routing.module';
import { CountriesAPIService } from './shared/countries-api.service';
import { provideHttpClient } from '@angular/common/http';
import { CustomValidators } from './components/films/film-edit/custom-validators';
import { environment } from '../environments/environment.development';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore,getFirestore } from '@angular/fire/firestore'
import { AngularFireModule } from '@angular/fire/compat';


export const appConfig: ApplicationConfig = {
  providers: [
    FilmsService,
    CountriesAPIService,
    CustomValidators,
    provideHttpClient(),
    importProvidersFrom([AppRoutingModule,
      provideFirebaseApp(()=>initializeApp(environment.firebase)),
      AngularFireModule.initializeApp(environment.firebase),
      provideFirestore(()=>getFirestore()),  
  ])],
};
