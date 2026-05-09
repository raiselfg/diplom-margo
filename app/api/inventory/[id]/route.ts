import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import prisma from '@/prisma/prisma-client';
import { itemSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = itemSchema.partial().parse(body);

    // If updating quantity, check if it's below current max reservations
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
        return NextResponse.json(
          {
            error: `Cannot reduce quantity below current reservations (${reservedCount})`,
          },
          { status: 400 },
        );
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: validatedData,
      include: { category: true },
    });

    return NextResponse.json(item);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 },
      );
    }
    console.error('Failed to update item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check for active reservations
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
      return NextResponse.json(
        { error: 'Cannot delete item with active reservations' },
        { status: 400 },
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 },
    );
  }
}
