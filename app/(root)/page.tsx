'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, CalendarDays, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/ui/components/ui/card';
import { Skeleton } from '@/ui/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import { Badge } from '@/ui/components/ui/badge';
import Link from 'next/link';

interface DashboardItem {
  id: string;
  name: string;
}

interface DashboardEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'CONFIRMED' | 'FINISHED';
}

async function fetchStats() {
  const [itemsRes, eventsRes] = await Promise.all([
    fetch('/api/inventory'),
    fetch('/api/events'),
  ]);

  if (!itemsRes.ok || !eventsRes.ok) throw new Error('Failed to fetch stats');

  return {
    items: (await itemsRes.json()) as DashboardItem[],
    events: (await eventsRes.json()) as DashboardEvent[],
  };
}

export default function AdminPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
  });

  if (error)
    return <div className="text-destructive">Ошибка загрузки данных</div>;

  const stats = [
    {
      title: 'Всего предметов',
      value: data?.items?.length || 0,
      icon: Package,
      description: 'Позиций в каталоге',
    },
    {
      title: 'Активные брони',
      value: data?.events?.filter((e) => e.status === 'CONFIRMED').length || 0,
      icon: CalendarDays,
      description: 'Подтвержденных мероприятий',
    },
    {
      title: 'Завершено',
      value: data?.events?.filter((e) => e.status === 'FINISHED').length || 0,
      icon: CheckCircle2,
      description: 'Прошедших событий',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор состояния системы и ближайших событий.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
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
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
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
                {data?.events?.slice(0, 5).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {new Date(event.startDate).toLocaleDateString()} —{' '}
                      {new Date(event.endDate).toLocaleDateString()}
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
                      <Link
                        href={`/events/${event.id}`}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        Редактировать
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.events || data.events.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-24 text-center"
                    >
                      Мероприятий не найдено
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
