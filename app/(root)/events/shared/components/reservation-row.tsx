'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Control, Controller, useWatch } from 'react-hook-form';
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
import { checkItemAvailability } from '@/lib/actions/availability';
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

export function ReservationRow({
  control,
  index,
  onRemove,
  inventory,
  startDate,
  endDate,
  eventId,
}: ReservationRowProps) {
  const [avail, setAvail] = useState<number | undefined>(undefined);
  const [isChecking, setIsChecking] = useState(false);

  const itemId = useWatch({
    control,
    name: `reservations.${index}.itemId`,
  });

  const quantity = useWatch({
    control,
    name: `reservations.${index}.quantity`,
  });

  useEffect(() => {
    async function check() {
      if (!itemId || !startDate || !endDate) {
        setAvail(undefined);
        return;
      }

      setIsChecking(true);
      try {
        const data = await checkItemAvailability({
          itemId,
          startDate,
          endDate,
          eventId,
        });
        setAvail(data.available);
      } catch (error) {
        console.error('Availability check failed:', error);
      } finally {
        setIsChecking(false);
      }
    }

    const timer = setTimeout(check, 300); // Debounce
    return () => clearTimeout(timer);
  }, [itemId, startDate, endDate, eventId]);

  const isOverLimit = avail !== undefined && quantity > avail;

  return (
    <TableRow>
      <TableCell>
        <Controller
          control={control}
          name={`reservations.${index}.itemId`}
          render={({ field: cField, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              <Select onValueChange={cField.onChange} value={cField.value}>
                <SelectTrigger
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Предмет" />
                </SelectTrigger>
                <SelectContent>
                  {inventory?.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
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
