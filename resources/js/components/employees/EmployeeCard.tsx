import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { getStorageUrl } from "@/lib/config";
import { useAuth } from "@/hooks/useAuth";

interface Employee {
  id: number;

  designationId: string;
  designation: string;
  name: string;
  email: string;
  phone: string;
  userRole: string;
  loginAllowed: boolean;
  status: string;
  image?: string;
}

interface EmployeeCardProps {
  employee: Employee;
  onView: (id: number) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onAssignSupervisor: (employee: Employee) => void;
}

export const EmployeeCard = ({
  employee,
  onView,
  onEdit,
  onDelete,
  onAssignSupervisor,
}: EmployeeCardProps) => {
  const { user } = useAuth();
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={getStorageUrl(employee.image)} alt={employee.name} />
            <AvatarFallback>
              {employee.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm truncate">{employee.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
              </div>
              <Badge variant={employee.status === "Active" ? "default" : "secondary"} className="text-xs shrink-0">
                {employee.status}
              </Badge>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">

              <div>
                <span className="text-muted-foreground">Role:</span>
                <span className="ml-1 font-medium">{employee.userRole}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <span className="ml-1 font-medium">{employee.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">{employee.designation}</Badge>
                <Badge variant={employee.loginAllowed ? "default" : "secondary"} className="text-xs">
                  {employee.loginAllowed ? "Login ✓" : "No Login"}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(employee.id)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {['manager', 'officer'].includes(employee.userRole.toLowerCase()) && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAssignSupervisor(employee)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
                {user?.permissions?.includes('employee.update') && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(employee)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {user?.permissions?.includes('employee.delete') && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(employee)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
