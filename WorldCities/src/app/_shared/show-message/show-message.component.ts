import { Component, OnDestroy, OnInit } from '@angular/core';
import { IShowMessage } from '@app/_models';

/** Shows messages to users as informative or as an error. */
@Component({
  selector: 'app-show-message',
  template: `
    <div class="showMessage">
      <p>
        <mat-error *ngIf="_errMsg">
          {{_errMsg}}
        </mat-error>
        <mat-label class="showMessageLabel" *ngIf="_msg">
          {{_msg}}
        </mat-label>
      </p>
    </div>
`,
  styles: [`
    .showMessageLabel {
      font-size: large;
      color: cornflowerblue;
    }
`]
})
export class ShowMessageComponent implements IShowMessage {

  _msg: string = '';
  _errMsg: string = '';

  constructor() { }

  set message(value: string) {
    this._errMsg = '';
    this._msg = value;
  }

  set errMessage(value: string) {
    this._msg = '';
    this._errMsg = value;
  }

  clear() {
    this._msg = '';
    this._errMsg = '';
  }
}
