export interface Carne {
  tipo: string;
  cortes: Corte[];
}

export interface Corte {
  nombre: string;
  preparaciones: string[];
  precioPorKilo: number;
  stock: number;
  imageUrl?: string;
}
