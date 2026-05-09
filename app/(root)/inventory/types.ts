export interface Category {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  category: Category;
  totalQuantity: number;
  description: string | null;
  createdAt: string;
}
