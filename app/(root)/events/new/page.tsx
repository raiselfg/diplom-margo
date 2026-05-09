import { getInventory } from '@/lib/actions/inventory';
import { NewEventView } from './components/new-event-view';
import { Suspense } from 'react';
import { Skeleton } from '@/ui/components/ui/skeleton';

export default function NewEventPage() {
  return (
    <Suspense fallback={<EventEditorSkeleton />}>
      <NewEventPageContent />
    </Suspense>
  );
}

async function NewEventPageContent() {
  const inventory = await getInventory();
  return <NewEventView inventory={inventory} />;
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
