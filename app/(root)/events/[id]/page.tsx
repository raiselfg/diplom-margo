'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/ui/components/ui/button';
import { eventSchema, type EventInput } from '@/lib/validations';

import { EventBasicInfoCard } from '../shared/components/event-basic-info-card';
import { EventStatusCard } from '../shared/components/event-status-card';
import { EventInventoryCard } from '../shared/components/event-inventory-card';
import { type EventData, type InventoryItem } from '../shared/types';

async function fetchEvent(id: string) {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error('Failed to fetch event');
  return (await res.json()) as EventData;
}

async function fetchInventory() {
  const res = await fetch('/api/inventory');
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return (await res.json()) as InventoryItem[];
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const queryClient = useQueryClient();
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id),
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
  });

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

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        status: event.status,
        reservations: event.reservations.map((r) => ({
          itemId: r.itemId,
          quantity: r.quantity,
        })),
      });
    }
  }, [event, form]);

  const watchStartDate = useWatch({ control: form.control, name: 'startDate' });
  const watchEndDate = useWatch({ control: form.control, name: 'endDate' });

  const mutation = useMutation({
    mutationFn: async (values: EventInput) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          (errorData as { error: string }).error || 'Failed to save event',
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Изменения сохранены');
      router.push('/events');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoadingEvent) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="size-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Редактирование мероприятия
        </h1>
      </div>

      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-8"
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
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Сохранить изменения
          </Button>
        </div>
      </form>
    </div>
  );
}
