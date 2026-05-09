import { getEvents } from '@/lib/actions/events';
import { EventsView } from './components/events-view';
import { Suspense } from 'react';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Card, CardContent } from '@/ui/components/ui/card';

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsSkeleton />}>
      <EventsPageContent />
    </Suspense>
  );
}

async function EventsPageContent() {
  const events = await getEvents();
  return <EventsView initialEvents={events} />;
}

function EventsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <Skeleton className="h-10 w-full max-w-sm" />

      <Card>
        <CardContent className="p-0">
          <div className="space-y-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b p-4 last:border-0"
              >
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex items-center gap-8">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
