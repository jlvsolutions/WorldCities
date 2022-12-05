import { Component, OnDestroy, OnInit } from '@angular/core';
import { IShowMessage, Message, MessageType } from '@app/_models';
import { Observable, takeUntil, Subject, BehaviorSubject, tap, map } from 'rxjs';

/** Shows messages to users as informative or as an error. */
@Component({
  selector: 'show-message',
  templateUrl: './show-message.component.html',
  styleUrls: ['./show-message.component.scss']
})
export class ShowMessageComponent implements IShowMessage, OnDestroy {
  
  _msg: string = '';
  _errMsg: string = '';
  _spinner: boolean = false;
  _message?: Message;
  private destroySubject = new Subject();

  constructor() { }

  set message(value: string) {
    this._errMsg = '';
    this._msg = value;
    this._spinner = false;
  }

  set spinner(value: string) {
    this._errMsg = '';
    this._msg = value;
    this._spinner = true;
  }

  set errMessage(value: string) {
    this._msg = '';
    this._errMsg = value;
    this._spinner = false;
  }

  clear() {
    this._msg = '';
    this._errMsg = '';
    this._spinner = false;
  }

  connect(message: Observable<Message>): void {
    message
      .pipe(takeUntil(this.destroySubject))
      .subscribe(m => {
        if (m.message === '')
          this.clear();
        else {
          switch (m.type) {
            case 'none':
              this.clear();
              break;
            case 'info':
              this.message = m.message;
              break;
            case 'error':
              this.errMessage = m.message;
              break;
            case 'spinner':
              this.spinner = m.message;
              break;
          }
        }
    });
  }

  disconnect(): void {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
