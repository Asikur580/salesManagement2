import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    is_active: boolean;
    order: number;
}

interface BrandCardProps {
    brand: Brand;
    onEdit: (brand: Brand) => void;
    onDelete: (id: number) => void;
}

export const BrandCard = ({ brand, onEdit, onDelete }: BrandCardProps) => {
    const { user } = useAuth();

    return (
        <Card className="mb-3">
            <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="shrink-0">
                        {brand.logo ? (
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-14 h-14 object-cover rounded-lg shadow-sm border"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center text-[10px] text-muted-foreground border">
                                No Logo
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base leading-tight">
                                {brand.name}
                            </h3>
                            <Badge
                                variant={
                                    brand.is_active ? "default" : "secondary"
                                }
                                className="text-[10px]"
                            >
                                {brand.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                            {brand.slug}
                        </p>
                        {brand.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {brand.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                    {user?.permissions?.includes("brand.update") && (
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
                    {user?.permissions?.includes("brand.delete") && (
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
            </CardContent>
        </Card>
    );
};
