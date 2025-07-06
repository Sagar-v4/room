'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { room } from '@/api/routes';

export function RoomJoinForm() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const trigger = 'Join';
  const title = 'Room Join';
  const description = 'Enter unique room code or link to get in.';

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">{trigger}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Form />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">{trigger}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <Form className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function Form({ className }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);

  const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);
  const paramCodeValue = searchParams.get(codeFieldName) || '';

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      try {
        setIsLoading(true);
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);

        const res = await fetch(room.exist.url, {
          method: room.exist.method,
          body: formData,
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
      <div className="grid gap-3">
        <Input
          autoFocus
          name={codeFieldName}
          disabled={isLoading}
          defaultValue={paramCodeValue}
          placeholder="Enter a code or link"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <LoaderCircle className="animate-spin" /> : 'Join'}
      </Button>
    </form>
  );
}
