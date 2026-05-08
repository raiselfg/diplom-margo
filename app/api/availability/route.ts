import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/prisma/prisma-client';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const eventId = searchParams.get('eventId'); // Optional: to exclude current event when editing

  if (!itemId || !startDateStr || !endDateStr) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 },
    );
  }

  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 },
      );
    }

    // Get total quantity of the item
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { totalQuantity: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
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
          id: eventId ? { not: eventId } : undefined, // Exclude current event if updating
        },
      },
    });

    const reservedQuantity = reservations._sum.quantity || 0;
    const availableQuantity = Math.max(
      0,
      item.totalQuantity - reservedQuantity,
    );

    return NextResponse.json({
      total: item.totalQuantity,
      reserved: reservedQuantity,
      available: availableQuantity,
    });
  } catch (error) {
    console.error('Failed to check availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 },
    );
  }
}
