import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User } from 'next-auth';

export function RoomForm({ user }: { user: User }) {
  return (
    <>
      <div className="absolute top-2 right-2 ml-2 bg-card flex  rounded-lg border p-4 shadow-sm gap-2">
        <Avatar className="size-9 rounded-lg">
          <AvatarImage src={user.image as string} />
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {user.email}
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
      <div className={cn('flex flex-col gap-6')}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome to Room</CardTitle>
            <CardDescription>What you want to do?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="default" className="w-full">
                  Create
                </Button>
                <Button variant="outline" className="w-full">
                  Join
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
