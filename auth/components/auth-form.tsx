'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/ui/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/ui/components/ui/field';
import { authClient } from '@/lib/auth-client';

import { authFormSchema, type AuthFormValues } from '../schemas';
import { Input } from '@/ui/components/ui/input';
import { Spinner } from '@/ui/components/ui/spinner';

export const AuthForm = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'all',
  });

  const onSubmit = async (values: AuthFormValues) => {
    const { error } = await authClient.signIn.email({
      ...values,
      rememberMe: true,
      callbackURL: '/',
    });

    if (error) {
      toast.error(error.message || 'Возникла ошибка при входе');
      throw new Error(error.message);
    }
  };

  return (
    <form id="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Почта</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="email@qwe.ru"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Пароль</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="******"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting ? 'Вход...' : 'Войти'}
        </Button>
      </FieldGroup>
    </form>
  );
};
