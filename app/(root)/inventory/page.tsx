import { getInventory } from '@/lib/actions/inventory';
import { getCategories } from '@/lib/actions/categories';
import { InventoryView } from './components/inventory-view';
import { Suspense } from 'react';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Card, CardContent } from '@/ui/components/ui/card';

export default function InventoryPage() {
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <InventoryPageContent />
    </Suspense>
  );
}

async function InventoryPageContent() {
  const [items, categories] = await Promise.all([
    getInventory(),
    getCategories(),
  ]);

  return <InventoryView initialItems={items} categories={categories} />;
}

function InventorySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b p-4 last:border-0"
              >
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-8">
                  <Skeleton className="h-6 w-20 rounded-full" />
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
