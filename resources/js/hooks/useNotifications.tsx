import { useMemo, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "alert" | "info" | "user";
  link?: string;
  created_at?: string;
}

export function useNotifications() {
  const { auth } = usePage<any>().props;
  const user = auth?.user;
  
  // Use data from shared props
  const unreadCount = user?.unread_count || 0;
  const rawNotifications = user?.notifications || [];

  // Map raw notifications to the format expected by the UI
  const notifications = useMemo((): Notification[] => {
    return rawNotifications.map((n: any) => {
      let type: "order" | "alert" | "info" | "user" = "info";
      let title = "Notification";
      let link = undefined;

      // Handle both database format (which we get from shared props)
      // and potentially others if we ever change them.
      const nType = n.type || "";
      if (nType.includes("OrderCreatedNotification")) {
        type = "order";
        title = "New Order";
        if (n.data?.order_number) {
            link = `/orders?view=${n.data.order_number}`;
        }
      } else if (nType.includes("OrderApprovedNotification")) {
        type = "order";
        title = "Order Approved";
        if (n.data?.order_number) {
            link = `/orders?view=${n.data.order_number}`;
        }
      } else if (nType.includes("LowStockNotification")) {
        type = "alert";
        title = "Low Stock Alert";
        if (n.data?.product_name) {
            link = `/products?search=${encodeURIComponent(n.data.product_name)}`;
        }
      }

      return {
        id: n.id,
        title: title,
        message: n.data?.message || "",
        time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: !!n.read_at,
        type: type,
        link: link,
        created_at: n.created_at
      };
    });
  }, [rawNotifications]);

  const markAsRead = (id: string) => {
    if (!user) return;
    router.post(`/notifications/${id}/read`, {}, {
      preserveScroll: true,
      preserveState: true
    });
  };

  const markAllAsRead = () => {
    if (!user) return;
    router.post("/notifications/read-all", {}, {
      preserveScroll: true,
      preserveState: true
    });
  };

  const fetchNotifications = () => {
    // For web-based, we trigger a reload to get fresh shared props
    router.reload({ only: ['auth'] });
  };

  // Background polling for auto-updates (Polling instead of WebSockets)
  useEffect(() => {
    if (user) {
        const interval = setInterval(() => {
            fetchNotifications();
        }, 60000); // Check every 1 minute
        return () => clearInterval(interval);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading: false, // Inertia handles its own loading states
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}


