import { LogOut } from 'lucide-react';
import { auth, signOut } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export async function UserForm() {
  const session = await auth();
  return (
    <>
      <div className="absolute top-2 right-2 ml-2 bg-card flex  rounded-lg border p-4 shadow-sm gap-2">
        <Avatar className="size-9 rounded-lg">
          <AvatarImage src={session?.user?.image as string} />
          <AvatarFallback>{session?.user?.name}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{session?.user?.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {session?.user?.email}
          </span>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <Button type="submit" variant="destructive" title="Logout">
            <LogOut />
          </Button>
        </form>
      </div>
    </>
  );
}
