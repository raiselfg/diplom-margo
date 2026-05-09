'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { updateItem } from '@/lib/actions/inventory';
import { Category, Item } from '@/lib/validations';

interface ItemEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  categories?: Category[];
}

export function ItemEditDialog({
  isOpen,
  onOpenChange,
  item,
  categories,
}: ItemEditDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item.name,
      categoryId: item.categoryId ?? undefined,
      totalQuantity: item.totalQuantity,
      description: item.description || '',
    },
  });

  useEffect(() => {
    form.reset({
      name: item.name,
      categoryId: item.categoryId ?? undefined,
      totalQuantity: item.totalQuantity,
      description: item.description || '',
    });
  }, [item, form, isOpen]);

  const onSubmit = async (values: ItemInput) => {
    setIsPending(true);
    try {
      await updateItem(item.id, values);
      onOpenChange(false);
      toast.success('Предмет обновлен');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при обновлении',
      );
    } finally {
      setIsPending(false);
    }
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
                  onValueChange={(val) => val && field.onChange(val)}
                  value={field.value}
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
            <Button type="submit" disabled={isPending}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
