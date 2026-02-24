import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Phone, Mail, MapPin, User, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getStorageUrl } from "@/lib/config";

interface Supplier {
    id: number;
    companyName: string;
    proprietorName: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    country: string;
    image?: string;
    status: "active" | "inactive";
}

interface SupplierCardProps {
    supplier: Supplier;
    onView: (id: number) => void;
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: number) => void;
}

export const SupplierCard = ({ supplier, onView, onEdit, onDelete }: SupplierCardProps) => {
    const { user } = useAuth();
    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Company Name and Image */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            {supplier.image && (
                                <img
                                    src={getStorageUrl(supplier.image)}
                                    alt={supplier.companyName}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{supplier.companyName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{supplier.proprietorName}</span>
                                </div>
                            </div>
                        </div>
                        <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                            {supplier.status}
                        </Badge>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{supplier.email}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <span className="text-sm line-clamp-2">{supplier.address}</span>
                                <span className="text-sm text-muted-foreground block mt-1">{supplier.country}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(supplier.id)}
                            className="flex-1"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                        </Button>
                        {user?.permissions?.includes('supplier.update') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(supplier)}
                                className="flex-1"
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {user?.permissions?.includes('supplier.delete') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(supplier.id)}
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
