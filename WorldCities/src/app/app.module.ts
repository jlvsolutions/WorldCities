import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ConnectionServiceModule, ConnectionServiceOptions, ConnectionServiceOptionsToken } from 'angular-connection-service';

// App Root
import { AppComponent } from './app.component';

// Feature Modules
import { NavMenuModule } from '@app/nav-menu/nav-menu.module';
import { HomeModule } from '@app/home/home.module';
import { CitiesModule } from '@app/cities/cities.module';
import { CountriesModule } from '@app/countries/countries.module';
import { UsersModule } from '@app/users/users.module';
import { AuthModule } from '@app/auth/auth.module';

// Routing Module
import { AppRoutingModule } from './app-routing.module';

import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { environment } from '../environments/environment';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { appInitializer } from './_helpers/app.initializer';
import { AuthService } from './_services';

import { RouteReuseStrategy } from '@angular/router';
import { WCReuseStrategy } from '@app/_helpers/wc-reuse-strategy';

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
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
        })], providers: [
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
        provideAppInitializer(() => {
        const initializerFn = (appInitializer)(inject(AuthService));
        return initializerFn();
      }),
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        //{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: RouteReuseStrategy, useClass: WCReuseStrategy },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
