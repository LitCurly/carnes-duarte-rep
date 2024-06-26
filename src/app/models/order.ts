import { CartItem } from './cart';

export interface Order {
  items: CartItem[];
  createdAt: Date;
  total?: number;
}
