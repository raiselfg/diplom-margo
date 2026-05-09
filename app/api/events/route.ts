import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/prisma/prisma-client';
import { eventApiSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = eventApiSchema.parse(body);

    // Interactive Transaction with Serializable isolation to prevent race conditions
    return await prisma.$transaction(
      async (tx) => {
        // 1. Check availability for each item
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

        // 2. Create Event
        const event = await tx.event.create({
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

        return NextResponse.json(event, { status: 201 });
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      if (
        error.message?.includes('Insufficient quantity') ||
        error.message?.includes('Item not found')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 },
    );
  }
}
