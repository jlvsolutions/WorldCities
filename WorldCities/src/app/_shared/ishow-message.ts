/** Interface for components that show an informational message */
export interface IShowMessage {
  set message(value: string);
  set errMessage(value: string);
  clear(): void;
}
