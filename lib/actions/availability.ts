'use server';

import { cacheTag } from 'next/cache';
import { headers } from 'next/headers';
import prisma from '@/prisma/prisma-client';
import { auth } from '@/lib/auth';

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

async function getCachedAvailability(params: {
  itemId: string;
  startDate: Date;
  endDate: Date;
  eventId?: string;
}) {
  'use cache';
  cacheTag('events');
  cacheTag('inventory');
  cacheTag(`item-${params.itemId}`);

  const { itemId, startDate, endDate, eventId } = params;

  // Get total quantity of the item
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { totalQuantity: true },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  // Calculate reserved quantity
  const reservations = await prisma.reservation.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      itemId,
      event: {
        status: 'CONFIRMED',
        startDate: { lt: endDate },
        endDate: { gt: startDate },
        id: eventId && eventId !== 'new' ? { not: eventId } : undefined,
      },
    },
  });

  const reservedQuantity = reservations._sum.quantity || 0;
  const availableQuantity = Math.max(0, item.totalQuantity - reservedQuantity);

  return {
    total: item.totalQuantity,
    reserved: reservedQuantity,
    available: availableQuantity,
  };
}

export async function checkItemAvailability(params: {
  itemId: string;
  startDate: Date;
  endDate: Date;
  eventId?: string;
}) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  return getCachedAvailability(params);
}
