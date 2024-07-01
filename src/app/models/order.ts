import { CartItem } from './cart';

export interface Order {
  id?: string; // El ID puede ser opcional
  items: CartItem[];
  createdAt: Date;
  total?: number;
}
