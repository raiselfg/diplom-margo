'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/ui/components/ui/button';
import { Spinner } from '@/ui/components/ui/spinner';
import { eventSchema, type EventInput } from '@/lib/validations';
import { updateEvent } from '@/lib/actions/events';

import { EventBasicInfoCard } from '../../shared/components/event-basic-info-card';
import { EventStatusCard } from '../../shared/components/event-status-card';
import { EventInventoryCard } from '../../shared/components/event-inventory-card';
import { type EventData, type InventoryItem } from '../../shared/types';

interface EditEventViewProps {
  id: string;
  event: EventData;
  inventory: InventoryItem[];
}

export function EditEventView({ id, event, inventory }: EditEventViewProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event.title,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      status: event.status as EventInput['status'],
      reservations: event.reservations.map((r) => ({
        itemId: r.itemId,
        quantity: r.quantity,
      })),
    },
  });

  const watchStartDate = useWatch({ control: form.control, name: 'startDate' });
  const watchEndDate = useWatch({ control: form.control, name: 'endDate' });

  const onSubmit = async (values: EventInput) => {
    setIsPending(true);
    try {
      await updateEvent(id, values);
      toast.success('Изменения сохранены');
      router.push('/events');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при сохранении',
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
        <h1 className="text-3xl font-bold tracking-tight">
          Редактирование мероприятия
        </h1>
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
          eventId={id}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </div>
  );
}
