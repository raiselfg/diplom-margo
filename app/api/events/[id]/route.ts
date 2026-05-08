import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import prisma from '@/prisma/prisma-client';
import { eventSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 },
    );
  }
}

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
    const validatedData = eventSchema.partial().parse(body);

    return await prisma.$transaction(
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

        // If status is changed to FINISHED, we don't need to check availability for future
        // But if it's CONFIRMED, we must check.
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
                  id: { not: id }, // EXCLUDE CURRENT EVENT
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

        // Update event
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

        return NextResponse.json(updatedEvent);
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      if (
        error.message.includes('Insufficient quantity') ||
        error.message.includes('Item not found') ||
        error.message === 'Event not found'
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    console.error('Failed to update event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
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
    await prisma.event.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 },
    );
  }
}
