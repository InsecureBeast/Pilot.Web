import { Observable, Subject } from "rxjs";
import { first } from "rxjs/operators";


export class QueueItem<T> {
    subscription: Subject<T>;
    cancel: Subject<any>;
    action: () => Promise<T>;
  
    constructor(action: () => Promise<T>, subscription: Subject<T>, cancel: Subject<any>) {
      this.cancel = cancel;
      this.subscription = subscription;
      this.action = action;
    }
  }

export class Queue<T> {

    private requests$ = new Subject<any>();
    private queue: QueueItem<T>[] = [];

    constructor() {
        this.requests$.subscribe(item => this.execute(item));
    }

    /** Call this method to add your http request to queue */
    enqueue(action: () => Promise<T>, cancel: Subject<any>): Observable<T> {
        const sub = new Subject<any>();
        const item = new QueueItem(action, sub, cancel);

        this.queue.push(item);
        item.cancel.pipe(first()).subscribe(value => {
            this.queue = [];
        });

        if (this.queue.length === 1) {
            this.startNextRequest();
        }
        return sub;
    }

    private execute(item: QueueItem<T>) {
        //One can enhance below method to fire post/put as well.
        item.action().then(res => {
            item.subscription.next(res);
            this.queue.shift();
            this.startNextRequest();
        })
          .catch(e => {
            this.queue.shift();
            this.startNextRequest();
          });
    }

    private startNextRequest() {
        // get next request, if any.
        if (this.queue.length > 0) {
          const request = this.queue[0];
          this.execute(request);
        }
    }
}
