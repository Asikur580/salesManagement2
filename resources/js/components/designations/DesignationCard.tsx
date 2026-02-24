import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Designation } from "@/Pages/Designations";

interface DesignationCardProps {
    designation: Designation;
    onEdit: (designation: Designation) => void;
    onDelete: (designation: Designation) => void;
}

export const DesignationCard = ({ designation, onEdit, onDelete }: DesignationCardProps) => {
    const { user } = useAuth();
    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Name and Status */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{designation.name}</h3>
                        </div>
                        <Badge variant={designation.status === 'active' ? 'default' : 'secondary'}>
                            {designation.status}
                        </Badge>
                    </div>

                    {/* Description */}
                    {designation.description && (
                        <div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {designation.description}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {user?.permissions?.includes('designation.update') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(designation)}
                                className="flex-1"
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {user?.permissions?.includes('designation.delete') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(designation)}
                                className="flex-1"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
