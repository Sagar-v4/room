import { auth } from '@/auth';
import { RoomForm } from '@/components/forms/room';
import { LoginForm } from '@/components/forms/login';

export default async function Home() {
  const session = await auth();

  return (
    <>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          {session?.user ? <RoomForm /> : <LoginForm />}
        </div>
      </div>
    </>
  );
}
