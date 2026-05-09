'use client';

import { Trash2 } from 'lucide-react';
import { Control, Controller, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { TableCell, TableRow } from '@/ui/components/ui/table';
import { Badge } from '@/ui/components/ui/badge';
import { Field, FieldError } from '@/ui/components/ui/field';
import { Spinner } from '@/ui/components/ui/spinner';
import { cn } from '@/ui/lib/utils';
import { EventInput } from '@/lib/validations';
import { InventoryItem } from '../types';

interface ReservationRowProps {
  control: Control<EventInput>;
  index: number;
  onRemove: () => void;
  inventory?: InventoryItem[];
  startDate?: Date;
  endDate?: Date;
  eventId: string;
}

async function checkAvailability(
  itemId: string,
  startDate: Date,
  endDate: Date,
  eventId?: string,
) {
  const params = new URLSearchParams({
    itemId: itemId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  if (eventId && eventId !== 'new') params.append('eventId', eventId);

  const res = await fetch(`/api/availability?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to check availability');
  return (await res.json()) as { available: number };
}

export function ReservationRow({
  control,
  index,
  onRemove,
  inventory,
  startDate,
  endDate,
  eventId,
}: ReservationRowProps) {
  const itemId = useWatch({
    control,
    name: `reservations.${index}.itemId`,
  });

  const quantity = useWatch({
    control,
    name: `reservations.${index}.quantity`,
  });

  const { data: availData, isLoading: isChecking } = useQuery({
    queryKey: [
      'availability',
      itemId,
      startDate?.toISOString(),
      endDate?.toISOString(),
      eventId,
    ],
    queryFn: () => checkAvailability(itemId, startDate!, endDate!, eventId),
    enabled: !!itemId && !!startDate && !!endDate,
    staleTime: 30000, // Cache for 30 seconds
  });

  const avail = availData?.available;
  const isOverLimit = avail !== undefined && quantity > avail;

  return (
    <TableRow>
      <TableCell>
        <Controller
          control={control}
          name={`reservations.${index}.itemId`}
          render={({ field: cField, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                onValueChange={cField.onChange}
                value={cField.value}
                items={inventory?.map((i) => ({ label: i.name, value: i.id }))}
              >
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {inventory?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </TableCell>
      <TableCell>
        <Controller
          control={control}
          name={`reservations.${index}.quantity`}
          render={({ field: cField, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                type="number"
                {...cField}
                onChange={(e) => cField.onChange(parseInt(e.target.value) || 0)}
                className={cn(isOverLimit && 'border-destructive')}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </TableCell>
      <TableCell className="text-right">
        {isChecking ? (
          <Spinner className="ml-auto" />
        ) : avail !== undefined ? (
          <Badge variant={isOverLimit ? 'destructive' : 'secondary'}>
            Свободно: {avail}
          </Badge>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="text-muted-foreground" data-icon />
        </Button>
      </TableCell>
    </TableRow>
  );
}
