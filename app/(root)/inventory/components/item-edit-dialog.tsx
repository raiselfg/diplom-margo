'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/ui/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { itemSchema, type ItemInput } from '@/lib/validations';
import { Category, InventoryItem } from '../types';

interface ItemEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
  categories?: Category[];
}

export function ItemEditDialog({
  isOpen,
  onOpenChange,
  item,
  categories,
}: ItemEditDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item.name,
      categoryId: item.categoryId,
      totalQuantity: item.totalQuantity,
      description: item.description || '',
    },
  });

  useEffect(() => {
    form.reset({
      name: item.name,
      categoryId: item.categoryId,
      totalQuantity: item.totalQuantity,
      description: item.description || '',
    });
  }, [item, form, isOpen]);

  const mutation = useMutation({
    mutationFn: async (values: ItemInput) => {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update item');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      onOpenChange(false);
      toast.success('Предмет обновлен');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: ItemInput) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить предмет</DialogTitle>
          <DialogDescription>Обновите данные предмета.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Название</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Напр: Стул белый"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="categoryId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Категория</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? null}
                  items={categories?.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="totalQuantity"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Общее количество</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Описание</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  value={field.value || ''}
                  aria-invalid={fieldState.invalid}
                  placeholder="..."
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
