'use client';

import { useState } from 'react';
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
import { categorySchema, type CategoryInput } from '@/lib/validations';
import { createCategory } from '@/lib/actions/categories';

interface CategoryCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryCreateDialog({
  isOpen,
  onOpenChange,
}: CategoryCreateDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: CategoryInput) => {
    setIsPending(true);
    try {
      await createCategory(values);
      onOpenChange(false);
      form.reset();
      toast.success('Категория создана');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при создании',
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать категорию</DialogTitle>
          <DialogDescription>
            Введите название новой категории.
          </DialogDescription>
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
                  placeholder="Напр: Мебель"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Создать категорию
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
