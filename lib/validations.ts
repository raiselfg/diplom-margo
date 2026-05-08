import * as z from 'zod';

export const itemSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  category: z.string().nullish(),
  totalQuantity: z
    .number()
    .int()
    .min(0, 'Количество не может быть отрицательным'),
  description: z.string().nullish(),
});

export const reservationSchema = z.object({
  itemId: z.uuid('Некорректный ID предмета'),
  quantity: z.number().int().min(1, 'Количество должно быть не менее 1'),
});

export const eventSchema = z
  .object({
    title: z.string().min(1, 'Название обязательно'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(['CONFIRMED', 'FINISHED']).default('CONFIRMED'),
    reservations: z.array(reservationSchema).optional().default([]),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'Дата окончания должна быть позже даты начала',
    path: ['endDate'],
  });

export type ItemInput = z.infer<typeof itemSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
