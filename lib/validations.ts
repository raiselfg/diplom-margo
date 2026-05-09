import z from 'zod';

// --- Base Schemas (Database Models) ---

export const baseCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Название обязательно'),
});

export const baseItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Название обязательно'),
  categoryId: z.string().uuid(),
  totalQuantity: z
    .number()
    .int()
    .min(0, 'Количество не может быть отрицательным'),
  description: z.string().nullish(),
  createdAt: z.union([z.date(), z.string()]),
});

export const baseReservationSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1, 'Количество должно быть не менее 1'),
});

export const baseEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Название обязательно'),
  startDate: z.union([z.date(), z.string()]),
  endDate: z.union([z.date(), z.string()]),
  status: z.enum(['CONFIRMED', 'FINISHED']),
});

// --- Inferred Model Types ---

export type Category = z.infer<typeof baseCategorySchema>;
export type Item = z.infer<typeof baseItemSchema> & {
  category: Category;
};
export type Reservation = z.infer<typeof baseReservationSchema> & {
  item?: Item;
};
export type Event = z.infer<typeof baseEventSchema> & {
  reservations: Reservation[];
  _count?: {
    reservations: number;
  };
};

// --- Form / Input Schemas ---

export const categorySchema = baseCategorySchema.omit({ id: true });

export const itemSchema = baseItemSchema.omit({ id: true, createdAt: true });

export const reservationInputSchema = baseReservationSchema.omit({
  id: true,
  eventId: true,
});

export const eventObjectSchema = baseEventSchema.omit({ id: true }).extend({
  startDate: z.date(),
  endDate: z.date(),
  reservations: z.array(reservationInputSchema),
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

// --- Inferred Input Types ---

export type CategoryInput = z.infer<typeof categorySchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type ReservationInput = z.infer<typeof reservationInputSchema>;
