import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Pencil, Trash2, Users, Calendar } from "lucide-react";

interface Role {
    id: string;
    name: string;
    description: string;
    userCount: number;
    createdAt: string;
    permissions: string[];
    isSystem?: boolean;
}

interface RoleCardProps {
    role: Role;
    onManagePermissions: (role: Role) => void;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
}

export const RoleCard = ({
    role,
    onManagePermissions,
    onEdit,
    onDelete,
}: RoleCardProps) => {
    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Role Name and System Badge */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{role.name}</h3>
                            {role.isSystem && (
                                <Badge variant="outline" className="text-xs mt-1">
                                    System
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{role.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs">Permissions</p>
                            <Badge variant="secondary" className="mt-1">
                                {role.permissions.length}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Users</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{role.userCount}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Created</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs">{role.createdAt}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onManagePermissions(role)}
                            className="w-full"
                        >
                            <Shield className="h-4 w-4 mr-1" />
                            Permissions
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(role)}
                            className="w-full"
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(role)}
                            className="w-full text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
