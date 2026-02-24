import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Customer } from "@/lib/customerData";
import { useAuth } from "@/hooks/useAuth";
import { getStorageUrl } from "@/lib/config";

interface CustomerCardProps {
    customer: Customer;
    isSelected: boolean;
    onSelect: (id: number, checked: boolean) => void;
    onView: (id: number) => void;
    onEdit: (customer: Customer) => void;
    onDelete: (id: number) => void;
}

export const CustomerCard = ({
    customer,
    isSelected,
    onSelect,
    onView,
    onEdit,
    onDelete,
}: CustomerCardProps) => {
    const { user } = useAuth();
    return (
        <Card className="mb-3">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header with checkbox and status */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => onSelect(customer.id, checked as boolean)}
                                className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    {customer.image && (
                                        <img
                                            src={getStorageUrl(customer.image)}
                                            alt={customer.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{customer.name}</h3>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {customer.proprietorName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Badge
                            variant={customer.status === "active" ? "default" : "secondary"}
                            className="text-xs shrink-0"
                        >
                            {customer.status}
                        </Badge>
                    </div>

                    {/* Customer details */}
                    <div className="grid grid-cols-1 gap-2 text-xs pl-8">
                        <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="ml-2 font-medium">{customer.contact.phone}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Address:</span>
                            <span className="ml-2 font-medium line-clamp-2">
                                {`${customer.address.street}, ${customer.address.city}`}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Officer:</span>
                            <span className="ml-2 font-medium">{customer.employeeName}</span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-1 pt-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => onView(customer.id)}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="text-xs">View</span>
                        </Button>
                        {user?.permissions?.includes('customer.update') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => onEdit(customer)}
                            >
                                <Pencil className="h-4 w-4 mr-1" />
                                <span className="text-xs">Edit</span>
                            </Button>
                        )}
                        {user?.permissions?.includes('customer.delete') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => onDelete(customer.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                <span className="text-xs">Delete</span>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
