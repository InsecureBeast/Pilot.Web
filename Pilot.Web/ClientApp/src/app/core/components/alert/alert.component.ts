import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscriber, Subscription} from "rxjs";
import {NotificationService} from "../../notification.service";
import {HttpErrorResponse} from "@angular/common/http";

class AlertMessage {
  type: string
  message: string
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {

  errorSubscription: Subscription

  constructor(private notificationService: NotificationService,
              private ref: ChangeDetectorRef) { }

  messages: AlertMessage[]

  ngOnInit(): void {
    this.messages = new Array<AlertMessage>();

    this.errorSubscription = this.notificationService
      .onError.subscribe(e => {
        const msg = new AlertMessage();
        msg.type = 'danger';
        if (e instanceof HttpErrorResponse) {
          msg.message = e.message;
        } else {
          msg.message = e.rejection?.message ?? e.message;
        }

        this.messages.push(msg);
        this.ref.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.errorSubscription.unsubscribe();
  }

  onClosed(msg: any): void {
    this.messages = this.messages.filter(m => m !== msg);
    this.ref.detectChanges();
  }

}
