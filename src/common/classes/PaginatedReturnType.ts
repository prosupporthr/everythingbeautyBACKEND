import { ReturnType } from './ReturnType';

export class PaginatedReturnType<T = any[]> extends ReturnType {
  data: T | any[];
  page: number;
  total: number;
  constructor({
    data = [] as any[],
    page = 1,
    total = 0,
    message,
    success,
  }: PaginatedReturnType<T>) {
    super({ message, success });
    this.data = data;
    this.page = page;
    this.total = total;
  }
}
