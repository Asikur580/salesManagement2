import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Category {
    id: number;
    name: string;
}

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
}

export const CategoryCard = ({ category, onEdit, onDelete }: CategoryCardProps) => {
    const { user } = useAuth();
    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Category Name */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <FolderOpen className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {user?.permissions?.includes('category.update') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(category)}
                            className="flex-1"
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        )}
                        {user?.permissions?.includes('category.delete') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(category.id)}
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
