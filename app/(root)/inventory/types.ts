export interface Category {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string | null;
  category: Category | null;
  totalQuantity: number;
  description: string | null;
  createdAt: string;
}
