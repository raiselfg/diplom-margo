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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/ui/components/ui/empty';

import { CategoryCreateDialog } from './category-create-dialog';
import { CategoryEditDialog } from './category-edit-dialog';
import { DeleteConfirmDialog } from '@/ui/components/delete-confirm-dialog';
import { deleteCategory } from '@/lib/actions/categories';

import { Category } from '@/lib/validations';

interface CategoriesViewProps {
  initialCategories: Category[];
}

export function CategoriesView({ initialCategories }: CategoriesViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCategories = initialCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await deleteCategory(deletingId);
      setDeletingId(null);
      toast.success('Категория удалена');
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
          <h1 className="text-3xl font-bold tracking-tight">Категории</h1>
          <p className="text-muted-foreground text-sm">
            Управление категориями для инвентаря.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus data-icon="inline-start" />
          Добавить категорию
        </Button>
      </div>

      <div className="flex max-w-sm items-center gap-2">
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

      <Card>
        <CardContent className="p-0">
          {filteredCategories.length === 0 ? (
            <Empty className="rounded-none border-0 border-t">
              <EmptyHeader>
                <Search className="text-muted-foreground size-8" />
                <EmptyTitle>Категории не найдены</EmptyTitle>
                <EmptyDescription>
                  Попробуйте изменить запрос или добавить новую категорию.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil data-icon="inline-start" />
                            Изменить
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingId(category.id)}
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

      <CategoryCreateDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingCategory && (
        <CategoryEditDialog
          isOpen={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        isPending={isDeleting}
        title="Удалить категорию?"
        description="Это действие нельзя отменить. Категория будет удалена только если в ней нет предметов."
      />
    </div>
  );
}
