'use client';

import { Control, Controller } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/ui/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { Field, FieldError, FieldDescription } from '@/ui/components/ui/field';
import { EventInput } from '@/lib/validations';

interface EventStatusCardProps {
  control: Control<EventInput>;
}

export function EventStatusCard({ control }: EventStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статус</CardTitle>
      </CardHeader>
      <CardContent>
        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                onValueChange={(val) => val && field.onChange(val)}
                value={field.value}
              >
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">Забронировано</SelectItem>
                  <SelectItem value="FINISHED">Завершено</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Завершенные мероприятия освобождают инвентарь.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
}
