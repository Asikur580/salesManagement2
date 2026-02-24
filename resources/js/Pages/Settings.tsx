import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Moon, Sun, Monitor, Globe, Shield } from "lucide-react";

export default function Settings() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your application preferences and system configurations.
                    </p>
                </div>

                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>
                                    Configure general system behavior and regional preferences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label className="text-base">Automatic Updates</Label>
                                        <span className="text-sm text-muted-foreground">
                                            Automatically install new updates when available.
                                        </span>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label className="text-base">Analytics</Label>
                                        <span className="text-sm text-muted-foreground">
                                            Allow the application to collect anonymous usage data.
                                        </span>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Settings */}
                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>
                                    Customize the look and feel of the application.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-base">Theme</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Select your preferred theme for the dashboard.
                                    </p>
                                    <div className="grid grid-cols-3 gap-4 pt-2">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-24 w-full rounded-md border-2 border-muted bg-[#ecedef] p-2 hover:border-primary cursor-pointer flex items-center justify-center">
                                                <Sun className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <span className="text-sm font-medium">Light</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-24 w-full rounded-md border-2 border-muted bg-slate-950 p-2 hover:border-primary cursor-pointer flex items-center justify-center">
                                                <Moon className="h-6 w-6 text-white" />
                                            </div>
                                            <span className="text-sm font-medium">Dark</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-24 w-full rounded-md border-2 border-muted bg-slate-900 p-2 hover:border-primary cursor-pointer flex items-center justify-center">
                                                <Monitor className="h-6 w-6 text-white" />
                                            </div>
                                            <span className="text-sm font-medium">System</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>
                                    Choose what you want to be notified about.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label className="text-base">Order Alerts</Label>
                                        <span className="text-sm text-muted-foreground">
                                            Receive notifications for new orders and status changes.
                                        </span>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label className="text-base">Stock Low Alerts</Label>
                                        <span className="text-sm text-muted-foreground">
                                            Get notified when product stock falls below the threshold.
                                        </span>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label className="text-base">Email Monthly Reports</Label>
                                        <span className="text-sm text-muted-foreground">
                                            Receive a summary of sales performance every month.
                                        </span>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
