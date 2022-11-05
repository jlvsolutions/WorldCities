import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ConnectionServiceModule, ConnectionServiceOptions, ConnectionServiceOptionsToken } from 'angular-connection-service';

// Feature Modules
import { NavMenuModule } from '@app/nav-menu/nav-menu.module';
import { HomeModule } from '@app/home/home.module';
import { CitiesModule } from '@app/cities/cities.module';
import { CountriesModule } from '@app/countries/countries.module';
import { UsersModule } from '@app/users/users.module';
import { AuthModule } from '@app/auth/auth.module';

import { AppComponent } from './app.component';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { environment } from '../environments/environment';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { appInitializer } from './_helpers/app.initializer';
import { AuthService } from './_services';

import { RouteReuseStrategy } from '@angular/router';
import { WCReuseStrategy } from './_helpers/wcReuseStrategy';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NavMenuModule,
    HomeModule,
    CitiesModule,
    CountriesModule,
    UsersModule,
    AuthModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  //exports: [
  //  SharedModule
  //],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache({
            addTypename: false
          }),
          link: httpLink.create({
            uri: environment.baseUrl + 'api/graphql',
          }),
          defaultOptions: {
            watchQuery: { fetchPolicy: 'no-cache' },
            query: { fetchPolicy: 'no-cache' }
          }
        };
      },
      deps: [HttpLink],
    },
    {
      provide: ConnectionServiceOptionsToken,
      useValue: <ConnectionServiceOptions>{
        enableHeartbeat: true,
        heartbeatUrl: environment.baseUrl + 'api/heartbeat',
        heartbeatInterval: 30000,
        heartbeatRetryInterval: 1000,
        requestMethod: "head"
      }
    },
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthService] },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: WCReuseStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
