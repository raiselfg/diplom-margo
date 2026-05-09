import { getInventory } from '@/lib/actions/inventory';
import { getEvents } from '@/lib/actions/events';
import { Package, CalendarDays, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/ui/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/ui/components/ui/empty';
import { Skeleton } from '@/ui/components/ui/skeleton';
import Link from 'next/link';
import { Suspense } from 'react';

function FormattedDate({ date }: { date: Date | string }) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return <span suppressHydrationWarning>{d.toLocaleDateString()}</span>;
}

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Главная</h1>
        <p className="text-muted-foreground text-sm">
          Обзор состояния системы и ближайших событий.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <AdminPageContent />
      </Suspense>
    </div>
  );
}

async function AdminPageContent() {
  const [items, events] = await Promise.all([getInventory(), getEvents()]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(
    (event) => new Date(event.startDate) >= today,
  );

  const stats = [
    {
      title: 'Всего предметов',
      value: items.length,
      icon: Package,
      description: 'Позиций в каталоге',
    },
    {
      title: 'Активные брони',
      value: events.filter((e) => e.status === 'CONFIRMED').length,
      icon: CalendarDays,
      description: 'Подтвержденных мероприятий',
    },
    {
      title: 'Завершено',
      value: events.filter((e) => e.status === 'FINISHED').length,
      icon: CheckCircle2,
      description: 'Прошедших событий',
    },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="text-muted-foreground" data-icon />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground mt-1 text-xs">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ближайшие мероприятия</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <Empty className="border-0">
              <EmptyHeader>
                <CalendarDays className="text-muted-foreground size-8" />
                <EmptyTitle>Мероприятий не найдено</EmptyTitle>
                <EmptyDescription>
                  В ближайшее время мероприятий не запланировано.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Даты</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingEvents.slice(0, 5).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <FormattedDate date={event.startDate} /> —{' '}
                      <FormattedDate date={event.endDate} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.status === 'CONFIRMED' ? 'default' : 'secondary'
                        }
                      >
                        {event.status === 'CONFIRMED'
                          ? 'Забронировано'
                          : 'Завершено'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>Редактировать</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
