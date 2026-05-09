'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/ui/components/ui/button';
import { Spinner } from '@/ui/components/ui/spinner';
import { eventSchema, type EventInput } from '@/lib/validations';
import { createEvent } from '@/lib/actions/events';

import { EventBasicInfoCard } from '../../shared/components/event-basic-info-card';
import { EventStatusCard } from '../../shared/components/event-status-card';
import { EventInventoryCard } from '../../shared/components/event-inventory-card';
import { type InventoryItem } from '../../shared/types';

interface NewEventViewProps {
  inventory: InventoryItem[];
}

export function NewEventView({ inventory }: NewEventViewProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const defaultDates = useMemo(() => {
    const start = new Date();
    const end = new Date(start.getTime() + 86400000);
    return { start, end };
  }, []);

  const form = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      startDate: defaultDates.start,
      endDate: defaultDates.end,
      status: 'CONFIRMED',
      reservations: [],
    },
  });

  const watchStartDate = useWatch({ control: form.control, name: 'startDate' });
  const watchEndDate = useWatch({ control: form.control, name: 'endDate' });

  const onSubmit = async (values: EventInput) => {
    setIsPending(true);
    try {
      await createEvent(values);
      toast.success('Мероприятие создано');
      router.push('/events');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при создании',
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Новое мероприятие</h1>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <EventBasicInfoCard control={form.control} />
          <EventStatusCard control={form.control} />
        </div>

        <EventInventoryCard
          control={form.control}
          inventory={inventory}
          startDate={watchStartDate}
          endDate={watchEndDate}
          eventId="new"
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? 'Создание...' : 'Создать мероприятие'}
          </Button>
        </div>
      </form>
    </div>
  );
}
