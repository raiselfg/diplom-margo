import { AuthForm } from '@/auth/components/auth-form';
import { Card, CardHeader, CardContent } from '@/ui/components/ui/card';

export default function AuthPage() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-1/2">
      <Card className="min-w-sm">
        <CardHeader>Введите почту и пароль</CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
