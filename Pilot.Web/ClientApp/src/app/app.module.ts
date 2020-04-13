import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule, RouteReuseStrategy } from '@angular/router';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { AuthGuard } from './auth/auth.guard';

import { ErrorModule } from './ui/error/error.module';
import { AuthComponent } from './auth/auth/auth.component';
import { AuthModule } from './auth/auth.module';
import { DocumentsRoutingModule } from './documents/documents-routing.module';
import { DocumentsModule } from './documents/documents.module';
import { DocumentsComponent } from './documents/pages/documents/documents.component';
import { ModalModule } from './ui/modal/modal.module';
import { RouteReuseService } from './core/route-reuse.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ErrorModule,
    AuthModule,
    ModalModule,
    RouterModule.forRoot([
      { path: '', component: DocumentsComponent, pathMatch: 'full', canActivate: [AuthGuard] },
      { path: 'counter', component: CounterComponent, canActivate: [AuthGuard]},
      { path: 'fetch-data', component: FetchDataComponent, pathMatch: 'prefix', canActivate: [AuthGuard] },
      { path: 'login', component: AuthComponent },

      // otherwise redirect to home
      { path: '*', redirectTo: 'login' }
    ]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader, // экспортированная factory функция, необходимая для компиляции в режиме AoT
        deps: [HttpClient]
      }
    }),
    DocumentsModule,
    DocumentsRoutingModule
  ],
  providers: [
    AuthGuard,
    { provide: RouteReuseStrategy, useClass: RouteReuseService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
