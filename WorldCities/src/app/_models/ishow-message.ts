import { Observable, Subject, BehaviorSubject, tap, map } from 'rxjs';

/** Interface for components that show an informational message */
export interface IShowMessage {
  /** Shows given informational message */
  set message(value: string);
  /** Shows a spinner and message */
  set spinner(value: string);
  /** Shows given error message */
  set errMessage(value: string);
  /** Clears any message from showing */
  clear(): void;
  connect(message: Observable<Message>): void;
  disconnect(): void;
}

export type MessageType = 'error' | 'info' | 'spinner' | 'none';
export class Message {
  type: MessageType = 'none';
  message: string = '';
}
