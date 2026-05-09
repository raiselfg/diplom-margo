import { getEventById } from '@/lib/actions/events';
import { getInventory } from '@/lib/actions/inventory';
import { EditEventView } from './components/edit-event-view';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/ui/components/ui/skeleton';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<EventEditorSkeleton />}>
      <EditEventPageContent id={id} />
    </Suspense>
  );
}

async function EditEventPageContent({ id }: { id: string }) {
  let data;
  try {
    const [event, inventory] = await Promise.all([
      getEventById(id),
      getInventory(),
    ]);
    data = { event, inventory };
  } catch {
    notFound();
  }

  return (
    <EditEventView id={id} event={data.event} inventory={data.inventory} />
  );
}

function EventEditorSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-9 w-64" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-64 rounded-xl md:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>

      <Skeleton className="h-96 rounded-xl" />

      <div className="flex justify-end gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}
