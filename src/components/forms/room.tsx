import { cn } from '@/lib/utils';
import { RoomCreateForm } from '@/components/forms/room-create';
import { RoomJoinForm } from '@/components/forms/room-join';
import { UserForm } from '@/components/forms/user-info';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function RoomForm() {
  return (
    <>
      <UserForm />
      <div className={cn('flex flex-col gap-6')}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome to Room</CardTitle>
            <CardDescription>Create a room or join with a code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <RoomCreateForm />
                <RoomJoinForm />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
