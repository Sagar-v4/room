'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { room } from '@/api/routes';

export function RoomCreateForm({ className }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      try {
        setIsLoading(true);
        e.preventDefault();

        const res = await fetch(room.create.url, {
          method: room.create.method,
        });

        const data = await res.json();
        if (!data[codeFieldName]) {
          toast.error('Invalid code or link!');
          return;
        }

        router.push('/' + data[codeFieldName]);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [codeFieldName, router],
  );

  return (
    <form
      className={cn('grid items-start gap-6', className)}
      onSubmit={handleSubmit}
    >
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <LoaderCircle className="animate-spin" /> : 'Create'}
      </Button>
    </form>
  );
}
