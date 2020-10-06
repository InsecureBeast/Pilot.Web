import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { RouterModule, RouteReuseStrategy } from '@angular/router';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { AuthGuard } from './auth/auth.guard';
import { ErrorModule } from './ui/error/error.module';
import { AuthComponent } from './auth/auth/auth.component';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { DocumentsComponent } from './documents/pages/documents/documents.component';
import { ModalModule } from './ui/modal/modal.module';
import { RouteReuseService } from './core/route-reuse.service';
import { TasksModule } from './tasks/tasks.module';
import { CacheInterceptor } from './core/interceptors/cache.interceptor';
import { ImagesCacheInterceptor } from './core/interceptors/images-cache.interceptor';
import { ClickStopPropagationDirective, ClickPreventDefaultDirective } from './core/directives/stop-propagation.directive';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    ClickStopPropagationDirective,
    ClickPreventDefaultDirective
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
      { path: 'login', component: AuthComponent },

      // otherwise redirect to home
      { path: '*', redirectTo: 'login' }
    ], { scrollPositionRestoration: 'disabled' }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader, // экспортированная factory функция, необходимая для компиляции в режиме AoT
        deps: [HttpClient]
      }
    }),
    DocumentsModule,
    TasksModule
  ],
  providers: [
    AuthGuard,
    { provide: RouteReuseStrategy, useClass: RouteReuseService },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ImagesCacheInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
