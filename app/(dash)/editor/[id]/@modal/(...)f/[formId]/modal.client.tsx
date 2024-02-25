'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function Modal({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    function onDismiss() {
        setTimeout(router.back, 300)
    }

    return (
        <Dialog defaultOpen onOpenChange={onDismiss}>
            <DialogContent className="overflow-auto h-[calc(100vh-3rem)] p-2 max-w-2xl">
                {children}
            </DialogContent>
        </Dialog>
    );
}