import { CartItem } from './cart';

export enum StatusEnum {
  Finalizada = "Finalizada",
  Pendiente = "Pendiente"
}

export interface Order {
  id?: string;
  items: CartItem[];
  createdAt: Date;
  total?: number;
  boletaURL?: string;
  status?: StatusEnum;
}


