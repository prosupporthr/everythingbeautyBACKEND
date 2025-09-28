export class ReturnType {
  success: boolean;
  message: string;
  data?: any;

  constructor({ success, message, data }: ReturnType) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export interface IReturnType {
  success: boolean;
  message: string;
  data?: any;
}
