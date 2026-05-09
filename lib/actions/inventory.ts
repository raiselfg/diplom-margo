'use server';

import { cacheTag, updateTag } from 'next/cache';
import { headers } from 'next/headers';
import prisma from '@/prisma/prisma-client';
import { itemSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

async function getCachedInventory(categoryId?: string | null) {
  'use cache';
  cacheTag('inventory');
  return await prisma.item.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInventory(categoryId?: string | null) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return getCachedInventory(categoryId);
}

export async function createItem(data: unknown) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const validatedData = itemSchema.parse(data);

  const item = await prisma.item.create({
    data: {
      name: validatedData.name,
      categoryId: validatedData.categoryId,
      totalQuantity: validatedData.totalQuantity,
      description: validatedData.description,
    },
    include: { category: true },
  });

  updateTag('inventory');
  return item;
}

export async function updateItem(id: string, data: unknown) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const validatedData = itemSchema.partial().parse(data);

  if (validatedData.totalQuantity !== undefined) {
    const maxReserved = await prisma.reservation.aggregate({
      _sum: { quantity: true },
      where: {
        itemId: id,
        event: { status: 'CONFIRMED' },
      },
    });

    const reservedCount = maxReserved._sum.quantity || 0;
    if (validatedData.totalQuantity < reservedCount) {
      throw new Error(
        `Нельзя уменьшить количество ниже текущих бронирований (${reservedCount})`,
      );
    }
  }

  const item = await prisma.item.update({
    where: { id },
    data: validatedData,
    include: { category: true },
  });

  updateTag('inventory');
  return item;
}

export async function deleteItem(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const activeReservations = await prisma.reservation.findFirst({
    where: {
      itemId: id,
      event: {
        status: 'CONFIRMED',
        endDate: { gte: new Date() },
      },
    },
  });

  if (activeReservations) {
    throw new Error('Нельзя удалить предмет с активными бронированиями');
  }

  await prisma.item.delete({
    where: { id },
  });

  updateTag('inventory');
}
