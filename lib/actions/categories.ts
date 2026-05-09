'use server';

import { cacheTag, updateTag } from 'next/cache';
import { headers } from 'next/headers';
import prisma, { Prisma } from '@/prisma/prisma-client';
import { categorySchema } from '@/lib/validations';
import { auth } from '@/lib/auth';

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

async function getCachedCategories() {
  'use cache';
  cacheTag('categories');
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getCategories() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return getCachedCategories();
}

export async function createCategory(data: unknown) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const validatedData = categorySchema.parse(data);

  try {
    const category = await prisma.category.create({
      data: validatedData,
    });
    updateTag('categories');
    return category;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('Категория с таким названием уже существует');
    }
    throw error;
  }
}

export async function updateCategory(id: string, data: unknown) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const validatedData = categorySchema.parse(data);

  try {
    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });
    updateTag('categories');
    return category;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('Категория с таким названием уже существует');
    }
    throw error;
  }
}

export async function deleteCategory(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    await prisma.category.delete({
      where: { id },
    });
    updateTag('categories');
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new Error(
        'Нельзя удалить категорию, так как в ней есть предметы или бронирования',
      );
    }
    throw error;
  }
}
