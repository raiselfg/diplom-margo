'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { type InventoryItem } from '../shared/types';

async function fetchInventory() {
  const res = await fetch('/api/inventory');
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return (await res.json()) as InventoryItem[];
}

export default function NewEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const watchStartDate = useWatch({ control: form.control, name: 'startDate' });
  const watchEndDate = useWatch({ control: form.control, name: 'endDate' });

  const mutation = useMutation({
    mutationFn: async (values: EventInput) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          (errorData as { error: string }).error || 'Failed to create event',
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Мероприятие создано');
      router.push('/events');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="size-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Новое мероприятие</h1>
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
          eventId="new"
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Создать мероприятие
          </Button>
        </div>
      </form>
    </div>
  );
}
