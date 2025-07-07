
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

/**
 * Listens for new bookings in real-time for the operator's buses
 * and shows a toast notification.
 * @param buses The list of buses belonging to the current operator.
 */
export function useRealtimeBookings(buses: Tables<'buses'>[] | undefined) {
  React.useEffect(() => {
    // We need the list of buses to filter notifications
    if (!buses || buses.length === 0) {
      return;
    }

    const operatorBusIds = new Set(buses.map(b => b.id));

    const channel = supabase
      .channel('realtime-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          const newBooking = payload.new as Tables<'bookings'>;

          // Only show notification if the booking is for one of the operator's buses
          if (operatorBusIds.has(newBooking.bus_id)) {
            const busName = buses.find(b => b.id === newBooking.bus_id)?.name || 'one of your buses';

            toast.info('New Booking Received!', {
              description: `A new seat has been booked on ${busName}.`,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime channel for bookings is active.');
        }
      });

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [buses]);
}
