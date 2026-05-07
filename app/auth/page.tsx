import { Button } from '@/ui/components/ui/button';
import { Card, CardHeader, CardContent } from '@/ui/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/ui/components/ui/field';
import { Input } from '@/ui/components/ui/input';
import Link from 'next/link';

export default function AuthPage() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-1/2">
      <Card className="min-w-sm">
        <CardHeader>Введите почту и пароль</CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Почта</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@qwe.ru"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Пароль</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  required
                />
              </Field>
              <Link href="/">
                <Button className="w-full" type="button">
                  Войти
                </Button>
              </Link>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
