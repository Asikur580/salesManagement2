import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, Mail, Shield, User as UserIcon } from "lucide-react";

export default function Profile() {
    const { user } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        My Profile
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Overview Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your profile photo and personal details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src="/placeholder-avatar.jpg" />
                                        <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-1 text-center sm:text-left">
                                    <h3 className="text-2xl font-bold">
                                        {user.name}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {user.email}
                                    </p>
                                    <Badge variant="secondary" className="mt-2">
                                        {user.roles
                                            ?.map((r) => r.name)
                                            .join(", ") || user.role}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            defaultValue={user.name}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            defaultValue={user.email}
                                            className="pl-9"
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="role"
                                            defaultValue={
                                                user.roles
                                                    ?.map((r) => r.name)
                                                    .join(", ") || user.role
                                            }
                                            className="pl-9 bg-muted"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Security Card (Placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>
                                Manage your password and security preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current-password">
                                    Current Password
                                </Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">
                                    New Password
                                </Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">
                                    Confirm New Password
                                </Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                            <div className="flex justify-end">
                                <Button variant="outline">
                                    Update Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
