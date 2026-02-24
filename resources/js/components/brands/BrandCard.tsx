import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Tag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Brand {
    id: number;
    name: string;
}

interface BrandCardProps {
    brand: Brand;
    onEdit: (brand: Brand) => void;
    onDelete: (id: number) => void;
}

export const BrandCard = ({ brand, onEdit, onDelete }: BrandCardProps) => {
    const { user } = useAuth();
    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Brand Name */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <Tag className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">{brand.name}</h3>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {user?.permissions?.includes('brand.update') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(brand)}
                            className="flex-1"
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        )}
                        {user?.permissions?.includes('brand.delete') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(brand.id)}
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
