import Image from 'next/image';
import { cn } from '@/lib/utils';
import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your favorite social account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <form
                action={async () => {
                  'use server';
                  await signIn('google');
                }}
              >
                <Button type="submit" variant="outline" className="w-full">
                  <Image alt="Google" src="google.svg" width={25} height={25} />
                  Signin with Google
                </Button>
              </form>
              <form
                action={async () => {
                  'use server';
                  await signIn('github');
                }}
              >
                <Button type="submit" variant="outline" className="w-full">
                  <Image alt="GitHub" src="github.svg" width={25} height={25} />
                  Signin with GitHub
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
