import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast';

export function FlashHandler() {
    const { props } = usePage();
    const { toast } = useToast();
    const flash = props.flash as any;

    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Success",
                description: flash.success,
            });
        }
        
        if (flash?.error) {
            toast({
                title: "Error",
                description: flash.error,
                variant: "destructive",
            });
        }

        if (flash?.message) {
            toast({
                title: "Information",
                description: flash.message,
            });
        }
    }, [flash]);

    return null;
}
