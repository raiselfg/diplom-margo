import * as z from 'zod';

export const authFormSchema = z.object({
  email: z.email('Введите корректный email').min(1, 'Введите email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;
