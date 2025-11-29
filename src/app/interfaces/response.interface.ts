export interface Response<T = any | null> {
  status: number;
  message: string;
  data?: T | null;
}