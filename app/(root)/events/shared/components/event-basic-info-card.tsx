'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';
import { Button } from '@/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/ui/components/ui/card';
import { Input } from '@/ui/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/components/ui/popover';
import { Calendar } from '@/ui/components/ui/calendar';
import { Field, FieldLabel, FieldError } from '@/ui/components/ui/field';
import { cn } from '@/ui/lib/utils';
import { EventInput } from '@/lib/validations';

interface EventBasicInfoCardProps {
  control: Control<EventInput>;
}

export function EventBasicInfoCard({ control }: EventBasicInfoCardProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Название мероприятия</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Напр: Свадьба Ивановых"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="startDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Дата и время начала</FieldLabel>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'flex-1 pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                        aria-invalid={fieldState.invalid}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (!date) return;
                          const newDate = new Date(date);
                          if (field.value) {
                            newDate.setHours(field.value.getHours());
                            newDate.setMinutes(field.value.getMinutes());
                          }
                          field.onChange(newDate);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="w-30"
                    value={field.value ? format(field.value, 'HH:mm') : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(field.value || new Date());
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      field.onChange(newDate);
                    }}
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="endDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Дата и время окончания</FieldLabel>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'flex-1 pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                        aria-invalid={fieldState.invalid}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (!date) return;
                          const newDate = new Date(date);
                          if (field.value) {
                            newDate.setHours(field.value.getHours());
                            newDate.setMinutes(field.value.getMinutes());
                          }
                          field.onChange(newDate);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="w-30"
                    value={field.value ? format(field.value, 'HH:mm') : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(field.value || new Date());
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      field.onChange(newDate);
                    }}
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
