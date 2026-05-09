'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/ui/components/ui/input-group';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/ui/components/ui/empty';

import { InventoryTable } from './components/inventory-table';
import { ItemCreateDialog } from './components/item-create-dialog';
import { ItemEditDialog } from './components/item-edit-dialog';
import { DeleteConfirmDialog } from '@/ui/components/delete-confirm-dialog';
import { type Category, type InventoryItem } from './types';

async function fetchInventory() {
  const res = await fetch('/api/inventory');
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return (await res.json()) as InventoryItem[];
}

async function fetchCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return (await res.json()) as Category[];
}

export default function InventoryPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const queryClient = useQueryClient();
  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          (errorData as { error: string }).error || 'Failed to delete item',
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setDeletingId(null);
      toast.success('Предмет удален');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredItems = items?.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.category?.name ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Инвентарь</h1>
          <p className="text-muted-foreground">
            Управление каталогом предметов и их остатками.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setIsAddOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Добавить предмет
        </Button>
      </div>

      <div className="flex max-w-sm items-center gap-2">
        <InputGroup>
          <InputGroupAddon>
            <Search data-icon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Поиск по названию или категории"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <Card>
        <CardContent className="p-0">
          {!isLoading && filteredItems?.length === 0 ? (
            <Empty className="rounded-none border-0 border-t">
              <EmptyHeader>
                <Search className="text-muted-foreground size-8" />
                <EmptyTitle>Ничего не найдено</EmptyTitle>
                <EmptyDescription>
                  Попробуйте изменить запрос или добавить новый предмет.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <InventoryTable
              items={filteredItems}
              isLoading={isLoading}
              onEdit={(item) => {
                setEditingItem(item);
              }}
              onDelete={(id) => {
                setDeletingId(id);
              }}
            />
          )}
        </CardContent>
      </Card>

      <ItemCreateDialog
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        categories={categories}
      />

      {editingItem && (
        <ItemEditDialog
          isOpen={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          categories={categories}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        isPending={deleteMutation.isPending}
        title="Удалить предмет?"
        description="Это действие нельзя отменить. Предмет будет навсегда удален из каталога."
      />
    </div>
  );
}
