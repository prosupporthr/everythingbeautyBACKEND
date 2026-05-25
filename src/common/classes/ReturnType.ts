export class ReturnType {
  success: boolean;
  message: string;
  data?: any;
  error?: any;

  constructor({ success, message, data, error }: ReturnType) {
    this.success = success;
    this.message = message;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.data = data;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.error = error;
  }
}

export interface IReturnType {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}
