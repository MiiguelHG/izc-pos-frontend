import { Meta } from "./metadata.interface";

export interface ListaElementos<T> {
  data: T[];
  meta: Meta;
}