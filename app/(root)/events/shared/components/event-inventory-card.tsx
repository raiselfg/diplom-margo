'use client';

import { Plus } from 'lucide-react';
import { Control, useFieldArray } from 'react-hook-form';
import { Button } from '@/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/ui/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import { EventInput } from '@/lib/validations';
import { InventoryItem } from '../types';
import { ReservationRow } from './reservation-row';

interface EventInventoryCardProps {
  control: Control<EventInput>;
  inventory?: InventoryItem[];
  startDate?: Date;
  endDate?: Date;
  eventId: string;
}

export function EventInventoryCard({
  control,
  inventory,
  startDate,
  endDate,
  eventId,
}: EventInventoryCardProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'reservations',
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Инвентарь</CardTitle>
          <CardDescription>
            Выберите предметы и укажите количество.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ itemId: '', quantity: 1 })}
        >
          <Plus className="mr-2 size-4" />
          Добавить позицию
        </Button>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div
            key="empty-inventory"
            className="text-muted-foreground rounded-lg border-2 border-dashed py-10 text-center"
          >
            Список инвентаря пуст. Нажмите кнопку выше, чтобы добавить предметы.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Предмет</TableHead>
                <TableHead className="w-32">Количество</TableHead>
                <TableHead className="w-48 text-right">Доступность</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <ReservationRow
                  key={field.id}
                  control={control}
                  index={index}
                  onRemove={() => remove(index)}
                  inventory={inventory}
                  startDate={startDate}
                  endDate={endDate}
                  eventId={eventId}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
