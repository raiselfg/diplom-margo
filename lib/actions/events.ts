'use server';

import { cacheTag, updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';
import prisma from '@/prisma/prisma-client';
import { eventApiSchema, eventObjectSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

async function getCachedEvents() {
  'use cache';
  cacheTag('events');
  return await prisma.event.findMany({
    include: {
      _count: {
        select: { reservations: true },
      },
    },
    orderBy: { startDate: 'asc' },
  });
}

export async function getEvents() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return getCachedEvents();
}

async function getCachedEventById(id: string) {
  'use cache';
  cacheTag(`event-${id}`);
  cacheTag('events');
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      reservations: {
        include: {
          item: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  return event;
}

export async function getEventById(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return getCachedEventById(id);
}

export async function createEvent(data: unknown) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const validatedData = eventApiSchema.parse(data);

  const event = await prisma.$transaction(
    async (tx) => {
      for (const res of validatedData.reservations) {
        const item = await tx.item.findUnique({
          where: { id: res.itemId },
          select: { totalQuantity: true, name: true },
        });

        if (!item) {
          throw new Error(`Item not found: ${res.itemId}`);
        }

        const overlappingReservations = await tx.reservation.aggregate({
          _sum: { quantity: true },
          where: {
            itemId: res.itemId,
            event: {
              status: 'CONFIRMED',
              startDate: { lt: validatedData.endDate },
              endDate: { gt: validatedData.startDate },
            },
          },
        });

        const reservedQuantity = overlappingReservations._sum.quantity || 0;
        const available = item.totalQuantity - reservedQuantity;

        if (res.quantity > available) {
          throw new Error(
            `Insufficient quantity for ${item.name}. Available: ${available}, Requested: ${res.quantity}`,
          );
        }
      }

      const newEvent = await tx.event.create({
        data: {
          title: validatedData.title,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          status: validatedData.status,
          reservations: {
            create: validatedData.reservations.map((res) => ({
              itemId: res.itemId,
              quantity: res.quantity,
            })),
          },
        },
        include: {
          reservations: {
            include: {
              item: true,
            },
          },
        },
      });

      return newEvent;
    },
    {
      isolationLevel: 'Serializable',
    },
  );

  updateTag('events');
  return event;
}

export async function updateEvent(id: string, data: unknown) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const validatedData = eventObjectSchema
    .extend({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
    .partial()
    .parse(data);

  const event = await prisma.$transaction(
    async (tx) => {
      const currentEvent = await tx.event.findUnique({
        where: { id },
        include: { reservations: true },
      });

      if (!currentEvent) {
        throw new Error('Event not found');
      }

      const newStartDate = validatedData.startDate || currentEvent.startDate;
      const newEndDate = validatedData.endDate || currentEvent.endDate;
      const newStatus = validatedData.status || currentEvent.status;

      if (newEndDate <= newStartDate) {
        throw new Error('Дата окончания должна быть позже даты начала');
      }

      if (newStatus === 'CONFIRMED') {
        const reservationsToCheck =
          validatedData.reservations || currentEvent.reservations;

        for (const res of reservationsToCheck) {
          const item = await tx.item.findUnique({
            where: { id: res.itemId },
            select: { totalQuantity: true, name: true },
          });

          if (!item) throw new Error(`Item not found: ${res.itemId}`);

          const overlappingReservations = await tx.reservation.aggregate({
            _sum: { quantity: true },
            where: {
              itemId: res.itemId,
              event: {
                id: { not: id },
                status: 'CONFIRMED',
                startDate: { lt: newEndDate },
                endDate: { gt: newStartDate },
              },
            },
          });

          const reservedQuantity = overlappingReservations._sum.quantity || 0;
          const available = item.totalQuantity - reservedQuantity;

          if (res.quantity > available) {
            throw new Error(
              `Insufficient quantity for ${item.name}. Available: ${available}, Requested: ${res.quantity}`,
            );
          }
        }
      }

      const updatedEvent = await tx.event.update({
        where: { id },
        data: {
          title: validatedData.title,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          status: validatedData.status,
          reservations: validatedData.reservations
            ? {
                deleteMany: {},
                create: validatedData.reservations.map((res) => ({
                  itemId: res.itemId,
                  quantity: res.quantity,
                })),
              }
            : undefined,
        },
        include: {
          reservations: {
            include: {
              item: true,
            },
          },
        },
      });

      return updatedEvent;
    },
    {
      isolationLevel: 'Serializable',
    },
  );

  updateTag('events');
  updateTag(`event-${id}`);
  return event;
}

export async function deleteEvent(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  await prisma.event.delete({
    where: { id },
  });

  updateTag('events');
}
