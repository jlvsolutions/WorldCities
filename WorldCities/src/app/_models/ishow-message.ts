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
}
