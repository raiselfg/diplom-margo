import z from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
});

export const itemSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  categoryId: z.uuid('Выберите категорию'),
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

export const eventObjectSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['CONFIRMED', 'FINISHED']),
  reservations: z.array(reservationSchema),
});

export const eventSchema = eventObjectSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'Дата окончания должна быть позже даты начала',
    path: ['endDate'],
  },
);

export const eventApiSchema = eventObjectSchema
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'Дата окончания должна быть позже даты начала',
    path: ['endDate'],
  });

export type CategoryInput = z.infer<typeof categorySchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
