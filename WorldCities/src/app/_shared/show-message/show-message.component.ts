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
          <ng-container *ngIf="_spinner">
             <mat-spinner diameter="17"></mat-spinner>
          </ng-container>
          {{_msg}}
        </mat-label>
      </p>
    </div>
`,
  styles: [`
    .showMessageLabel {
      font-size: large;
      color: steelblue;
      display: flex;
      align-items: center;
      justify-content: left;
    }
    .spinner: {
      display: inline-block;
      line-height: 30px;
    }
`]
})
export class ShowMessageComponent implements IShowMessage {

  
  _msg: string = '';
  _errMsg: string = '';
  _spinner: boolean = false;

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
}
