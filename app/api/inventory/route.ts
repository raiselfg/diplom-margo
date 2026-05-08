import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import prisma from '@/prisma/prisma-client';
import { itemSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = itemSchema.parse(body);

    const item = await prisma.item.create({
      data: {
        name: validatedData.name,
        category: validatedData.category,
        totalQuantity: validatedData.totalQuantity,
        description: validatedData.description,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 },
      );
    }
    console.error('Failed to create item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 },
    );
  }
}
