import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { RouteReuseStrategy, UrlSerializer } from '@angular/router';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
import { RouteReuseService } from './core/route-reuse.service';
import { CacheInterceptor } from './core/interceptors/cache.interceptor';
import { ImagesCacheInterceptor } from './core/interceptors/images-cache.interceptor';
import { ClickStopPropagationDirective, ClickPreventDefaultDirective } from './core/directives/stop-propagation.directive';
import { BootstrapUiModule } from './bootstrap-ui.module';
import { GlobalErrorHandler } from './core/global-error-handler';
import { ErrorModule } from './components/error/error.module';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { AlertComponent } from './components/alert/alert.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomUrlSerializer } from './core/tools/custom-url.serializer';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    AlertComponent,
    ClickStopPropagationDirective,
    ClickPreventDefaultDirective
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ErrorModule,
    ModalModule,
    AppRoutingModule,
    BootstrapUiModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader, // экспортированная factory функция, необходимая для компиляции в режиме AoT
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    AuthGuard,
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: RouteReuseStrategy, useClass: RouteReuseService },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ImagesCacheInterceptor, multi: true },
    { provide: UrlSerializer, useClass: CustomUrlSerializer },
    { provide: LOCALE_ID, useValue: "ru-RU" }, //replace "de-at" with your locale
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
