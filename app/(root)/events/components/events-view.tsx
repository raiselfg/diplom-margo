'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';

import { Card, CardContent } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/ui/components/ui/input-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';
import { Badge } from '@/ui/components/ui/badge';
import { DeleteConfirmDialog } from '@/ui/components/delete-confirm-dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/ui/components/ui/empty';
import { deleteEvent } from '@/lib/actions/events';

import { Event } from '@/lib/validations';

interface EventsViewProps {
  initialEvents: Event[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEvents = initialEvents.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await deleteEvent(deletingId);
      setDeletingId(null);
      toast.success('Мероприятие удалено');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при удалении',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мероприятия</h1>
          <p className="text-muted-foreground text-sm">
            Планирование событий и управление бронированием.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus />
            Новое мероприятие
          </Link>
        </Button>
      </div>

      <div className="flex max-w-sm items-center gap-2">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Поиск по названию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredEvents.length === 0 ? (
            <Empty className="rounded-none border-0 border-t">
              <EmptyHeader>
                <CalendarDays className="text-muted-foreground size-8" />
                <EmptyTitle>Мероприятия не найдены</EmptyTitle>
                <EmptyDescription>
                  Попробуйте изменить запрос или создать новое мероприятие.
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
                  <TableHead>Позиций</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell
                      className="text-muted-foreground text-xs whitespace-nowrap"
                      suppressHydrationWarning
                    >
                      {format(new Date(event.startDate), 'd MMM', {
                        locale: ru,
                      })}{' '}
                      -{' '}
                      {format(new Date(event.endDate), 'd MMM yyyy', {
                        locale: ru,
                      })}
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
                    <TableCell>{event._count?.reservations || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/events/${event.id}`}>
                              <Pencil />
                              Изменить
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingId(event.id)}
                          >
                            <Trash2 />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        isPending={isDeleting}
        title="Удалить мероприятие?"
        description="Это действие нельзя отменить. Все бронирования инвентаря для этого события будут удалены."
      />
    </div>
  );
}
