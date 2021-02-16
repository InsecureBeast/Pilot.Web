import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(translate: TranslateService) {
    translate.addLangs(['en', 'ru'])
    translate.setDefaultLang('en');
    translate.use('ru');
    registerLocaleData(localeRu);
  }
}
