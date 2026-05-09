export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
}

export interface EventData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'CONFIRMED' | 'FINISHED';
  reservations: Array<{
    itemId: string;
    quantity: number;
  }>;
}
