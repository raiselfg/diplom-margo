import { getCategories } from '@/lib/actions/categories';
import { CategoriesView } from './components/categories-view';
import { Suspense } from 'react';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Card, CardContent } from '@/ui/components/ui/card';

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesPageContent />
    </Suspense>
  );
}

async function CategoriesPageContent() {
  const categories = await getCategories();
  return <CategoriesView initialCategories={categories} />;
}

function CategoriesSkeleton() {
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
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
