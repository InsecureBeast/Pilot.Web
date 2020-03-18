import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-document',
    templateUrl: './document.component.html',
    styleUrls: ['./document.component.css']
})
/** document component*/
export class DocumentComponent {
  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();

  /** document-details ctor */
  constructor(private router: Router) {

  }

  closeModal($event) {
    this.router.navigate([{ outlets: { modal: null } }]);
    this.modalClose.next($event);
  }
}
}
