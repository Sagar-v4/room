'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function RoomCreateForm({ className }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    try {
      e.preventDefault();

      const res = await fetch('/api/room/create', {
        method: 'GET',
      });

      const data = await res.json();
      if (!data.code) {
        toast.error('Invalid code or link!');
        return;
      }

      router.push('/' + data.code);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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
