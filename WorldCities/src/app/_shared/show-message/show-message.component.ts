import { Component, OnDestroy, OnInit } from '@angular/core';

/** Shows messages to users as informative or as an error. */
@Component({
  selector: 'app-show-message',
  template: `
    <div class="showMessage">
      <p>
        <mat-error *ngIf="errMessage">
          {{errMessage}}
        </mat-error>
        <mat-label class="showMessageLabel" *ngIf="message">
          {{message}}
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
export class ShowMessageComponent {

  message: string = '';
  errMessage: string = '';

  constructor() { }


  /** Clears all messages. */
  clearMessages() {
    this.message = '';
    this.errMessage = '';
  }
  /**
   * Shows the given message.
   * @param success If True, message will be shown as informative. False shows message as an error.
   * @param message Message to be shown.
   */
  setMessages(success: boolean, message: string) {
    this.clearMessages();
    if (success) {
      this.message = message;
      this.errMessage = '';
    }
    else {
      this.message = '';
      this.errMessage = message;
    }
  }


}
