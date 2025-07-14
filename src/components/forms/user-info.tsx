import { LogOut } from 'lucide-react';
import { auth, signOut } from '@/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export async function UserForm() {
  const session = await auth();
  return (
    <>
      <div className="absolute top-3 right-4 ml-2 flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 rounded-full border">
              <Avatar className="size-11.5 rounded-full">
                <AvatarImage src={session?.user?.image as string} />
                <AvatarFallback>{session?.user?.name}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-4">
            <DropdownMenuLabel className="flex min-w-0 flex-col">
              <span className="text-foreground truncate text-sm font-medium">
                {session?.user?.name}
              </span>
              <span className="text-muted-foreground truncate text-xs font-normal">
                {session?.user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="p-0">
              <form
                action={async () => {
                  'use server';
                  await signOut();
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  title="Logout"
                  className="size-full justify-start"
                >
                  <LogOut
                    size={16}
                    className="text-destructive"
                    aria-hidden="true"
                  />
                  <span className="text-destructive">Logout</span>
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
