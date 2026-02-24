import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Clock, Package, AlertTriangle, UserPlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";

import { useNotifications, Notification } from "@/hooks/useNotifications";

interface NotificationsProps {
    notifications: {
        data: any[];
        links: any[];
        meta: any;
    } | any[]; // Support both paginated and non-paginated for flexibility
}

export default function Notifications({ notifications: initialNotifications }: NotificationsProps) {
    const { markAsRead, markAllAsRead, isLoading } = useNotifications();

    // Extract notifications array based on structure
    const notificationsList = Array.isArray(initialNotifications) 
        ? initialNotifications 
        : (initialNotifications as any).data || [];

    const unreadNotifications = notificationsList.filter((n: any) => !n.read_at);
    const readNotifications = notificationsList.filter((n: any) => n.read_at);

    // Map to the format expected by NotificationList
    const mappedNotifications: Notification[] = notificationsList.map((n: any) => {
        let type: "order" | "alert" | "info" | "user" = "info";
        let title = "Notification";
        let link = undefined;

        if (n.type.includes("OrderCreatedNotification")) {
            type = "order";
            title = "New Order";
            if (n.data?.order_number) link = `/orders?view=${n.data.order_number}`;
        } else if (n.type.includes("OrderApprovedNotification")) {
            type = "order";
            title = "Order Approved";
            if (n.data?.order_number) link = `/orders?view=${n.data.order_number}`;
        } else if (n.type.includes("LowStockNotification")) {
            type = "alert";
            title = "Low Stock Alert";
            if (n.data?.product_name) link = `/products?search=${encodeURIComponent(n.data.product_name)}`;
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

    const displayUnread = mappedNotifications.filter(n => !n.read);
    const displayRead = mappedNotifications.filter(n => n.read);

    const deleteNotification = (id: string) => {
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearAll = () => {
        if (confirm("Are you sure you want to clear all notifications?")) {
            router.delete("/notifications", {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "order":
                return <Package className="h-5 w-5 text-primary" />;
            case "alert":
                return <AlertTriangle className="h-5 w-5 text-destructive" />;
            case "user":
                return <UserPlus className="h-5 w-5 text-blue-500" />;
            case "info":
                return <Clock className="h-5 w-5 text-muted-foreground" />;
            default:
                return <Bell className="h-5 w-5" />;
        }
    };

    const NotificationList = ({ items }: { items: Notification[] }) => {
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {items.map((notification) => (
                    <div
                        key={notification.id}
                        className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
                            !notification.read ? "bg-muted/40 border-primary/20" : "bg-card hover:bg-muted/20"
                        )}
                        onClick={() => {
                            markAsRead(notification.id);
                            if (notification.link) {
                                router.visit(notification.link);
                            }
                        }}
                    >
                        <div className={cn(
                            "flex items-center justify-center h-10 w-10 rounded-full border shadow-sm",
                            !notification.read ? "bg-background" : "bg-muted"
                        )}>
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <h4 className={cn(
                                    "text-sm font-medium leading-none",
                                    !notification.read && "font-bold"
                                )}>
                                    {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {notification.time}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {notification.message}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {!notification.read && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                    }}
                                    title="Mark as read"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                }}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">
                            View and manage your alerts and messages.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={markAllAsRead} disabled={displayUnread.length === 0}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                        <Button variant="outline" onClick={clearAll} disabled={mappedNotifications.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear all
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all" className="relative">
                            All
                            <span className="ml-2 text-xs text-muted-foreground">
                                {mappedNotifications.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="relative">
                            Unread
                            {displayUnread.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive">
                                    <span className="h-1.5 w-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Notifications</CardTitle>
                                <CardDescription>
                                    A complete history of your system alerts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationList items={mappedNotifications} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="unread">
                        <Card>
                            <CardHeader>
                                <CardTitle>Unread Notifications</CardTitle>
                                <CardDescription>
                                    Messages required your attention.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationList items={displayUnread} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
