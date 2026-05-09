'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Skeleton } from '@/ui/components/ui/skeleton';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/ui/components/ui/empty';

import { CategoryCreateDialog } from './components/category-create-dialog';
import { CategoryEditDialog } from './components/category-edit-dialog';
import { DeleteConfirmDialog } from '@/ui/components/delete-confirm-dialog';

interface Category {
  id: string;
  name: string;
}

async function fetchCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return (await res.json()) as Category[];
}

export default function CategoriesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeletingId(null);
      toast.success('Категория удалена');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredCategories = categories?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
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
          {!isLoading && filteredCategories?.length === 0 ? (
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
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-5" />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredCategories?.map((category) => (
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
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        isPending={deleteMutation.isPending}
        title="Удалить категорию?"
        description="Это действие нельзя отменить. Категория будет удалена только если в ней нет предметов."
      />
    </div>
  );
}
