// src/app/models/cart.ts
export interface CartItem {
  nombre: string
  cantidad: number
  precioPorKilo: number
  tipo: string // Asegúrate de incluir el tipo de carne
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  total: number
}
