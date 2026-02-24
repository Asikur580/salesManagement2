import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Key, Calendar, Tag } from "lucide-react";

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
    createdAt: string;
}

interface PermissionCardProps {
    permission: Permission;
    onEdit: (permission: Permission) => void;
    onDelete: (permission: Permission) => void;
}

export const PermissionCard = ({
    permission,
    onEdit,
    onDelete,
}: PermissionCardProps) => {
    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Permission Name */}
                    <div className="flex items-start gap-3">
                        <Key className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg font-mono">{permission.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {permission.description}
                            </p>
                        </div>
                    </div>

                    {/* Category and Date */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="secondary">{permission.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{permission.createdAt}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(permission)}
                            className="w-full"
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(permission)}
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
