'use client';

import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/ui/components/ui/input-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';
import { Badge } from '@/ui/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/ui/components/ui/empty';

import { ItemCreateDialog } from './item-create-dialog';
import { ItemEditDialog } from './item-edit-dialog';
import { DeleteConfirmDialog } from '@/ui/components/delete-confirm-dialog';
import { deleteItem } from '@/lib/actions/inventory';
import { Item, Category } from '@/lib/validations';

interface InventoryViewProps {
  initialItems: Item[];
  categories: Category[];
}

export function InventoryView({
  initialItems,
  categories,
}: InventoryViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filteredItems = initialItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesSearch;
  });

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await deleteItem(deletingId);
      setDeletingId(null);
      toast.success('Предмет удален');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при удалении',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Инвентарь</h1>
          <p className="text-muted-foreground text-sm">
            Управление предметами и их количеством.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus data-icon="inline-start" />
          Добавить предмет
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="max-w-sm flex-1">
          <InputGroup>
            <InputGroupAddon>
              <Search data-icon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Поиск по названию"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <Empty className="rounded-none border-0 border-t">
              <EmptyHeader>
                <Search className="text-muted-foreground size-8" />
                <EmptyTitle>Предметы не найдены</EmptyTitle>
                <EmptyDescription>
                  Попробуйте изменить запрос или добавить новый предмет.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Всего</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        {item.description && (
                          <span className="text-muted-foreground line-clamp-1 text-xs">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.category ? (
                        <Badge variant="outline">{item.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">
                          Без категории
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{item.totalQuantity}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingItem(item)}
                          >
                            <Pencil data-icon="inline-start" />
                            Изменить
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingId(item.id)}
                          >
                            <Trash2 data-icon="inline-start" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ItemCreateDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
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
        onConfirm={handleDelete}
        isPending={isDeleting}
        title="Удалить предмет?"
        description="Это действие нельзя отменить. Предмет будет удален только если он не забронирован в активных мероприятиях."
      />
    </div>
  );
}
