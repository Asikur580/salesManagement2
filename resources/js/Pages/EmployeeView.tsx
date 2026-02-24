import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, MapPin, Building, Briefcase, Shield, User, Users, Settings, UserPlus } from "lucide-react";
import { usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { getStorageUrl } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPermissionDialog } from "@/components/users/UserPermissionDialog";

interface Employee {
  id: number;
  userId: number; // Added userId because permissions are on the User model

  designationId: string;
  designation: string;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  bloodGroup: string;
  territory: string;
  district: string;
  image?: string;
  userRole: string;
  loginAllowed: boolean;
  status: string;
  supervisorId?: number;
  employeeId: string;
  creditLimit: string;
  supervisor?: {
    id: number;
    name: string;
    designation: string;
  };
  subordinates?: Array<{
    id: number;
    name: string;
    designation: string;
  }>;
  potentialSupervisors: Array<{
    id: number;
    name: string;
    role?: string;
    designation?: string;
    status: string;
  }>;
}

interface EmployeeViewProps {
  id: string;
  initialEmployee: any;
  initialPotentialSupervisors: any[];
  initialSubordinates: any[];
  allPermissions: any[];
  userPermissions: string[];
}

const EmployeeView = ({ id, initialEmployee, initialPotentialSupervisors, initialSubordinates, allPermissions, userPermissions }: EmployeeViewProps) => {
  const { toast } = useToast();
  const { flash } = usePage<any>().props;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Supervisor Assignment State
  const [isAssignSupervisorDialogOpen, setIsAssignSupervisorDialogOpen] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (flash?.success) {
      toast({
        title: "Success",
        description: flash.success,
      });
    }
    if (flash?.error) {
      toast({
        title: "Error",
        description: flash.error,
        variant: "destructive",
      });
    }
    if (flash?.message) {
      toast({
        title: "Info",
        description: flash.message,
      });
    }
  }, [flash]);

  useEffect(() => {
    if (initialEmployee) {
      const data = initialEmployee;
      const potentialSupervisors = (initialPotentialSupervisors || []).map((sup: any) => ({
        id: sup.id,
        name: sup.name,
        role: sup.role,
        designation: sup.designation,
        status: sup.status || 'active'
      }));

      let supervisorObj = undefined;
      if (data.parent) {
        supervisorObj = {
          id: data.parent.id,
          name: data.parent.user?.name || "",
          designation: data.parent.designation?.name || ""
        };
      }

      const mappedEmployee: Employee = {
        id: data.id,
        userId: data.user_id,
        designationId: data.designation_id?.toString() || "",
        designation: data.designation?.name || "",
        name: data.user?.name || "",
        email: data.user?.email || "",
        phone: data.phone || "",
        nationalId: data.national_id || "",
        bloodGroup: data.blood_group || "",
        territory: data.territory || "",
        district: data.district || "",
        image: data.image,
        userRole: data.role?.name || "",
        loginAllowed: Boolean(data.login_allowed),
        status: data.status === 'active' ? 'Active' : 'Inactive',
        supervisorId: data.parent_id,
        employeeId: data.employee_id || "",
        creditLimit: data.credit_limit || "",
        supervisor: supervisorObj,
        subordinates: (initialSubordinates || []).map((child: any) => ({
          id: child.id,
          name: child.name,
          designation: child.designation
        })),
        potentialSupervisors: potentialSupervisors
      };

      setEmployee(mappedEmployee);
      setSelectedSupervisorId(mappedEmployee.supervisorId);
    }
  }, [initialEmployee, initialPotentialSupervisors, initialSubordinates]);

  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

  const handleAssignSupervisor = async () => {
    if (!employee) return;

    setIsLoading(true);
    const payload = {
      supervisorId: selectedSupervisorId || null
    };

    router.post(`/employees/${employee.id}/assign-supervisor`, payload, {
      onSuccess: () => {
        setIsAssignSupervisorDialogOpen(false);
        toast({
          title: "Success",
          description: "Supervisor assigned successfully",
        });
      },
      onError: (errors: any) => {
        toast({
          title: "Error",
          description: Object.values(errors)[0] as string || "Failed to assign supervisor",
          variant: "destructive"
        });
      },
      onFinish: () => setIsLoading(false)
    });
  };

  const getSupervisorName = (supervisorId?: number) => {
    if (!supervisorId) return "No supervisor";
    if (employee?.supervisor && employee.supervisor.id === supervisorId) {
      return employee.supervisor.name;
    }
    const potential = employee?.potentialSupervisors.find(s => s.id === supervisorId);
    return potential?.name || "Unknown";
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.visit("/employees")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading employee details...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.visit("/employees")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Employee not found</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="ghost" size="sm" onClick={() => router.visit("/employees")} className="-ml-2 h-8 w-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Employee Details</h1>
              <p className="text-sm text-muted-foreground">View profile and team hierarchy</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['manager', 'officer'].includes(employee.userRole) && (
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setIsAssignSupervisorDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Supervisor
              </Button>
            )}
            <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setIsPermissionsDialogOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Permissions
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getStorageUrl(employee.image)} alt={employee.name} />
                <AvatarFallback className="text-2xl">
                  {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-2xl font-bold">{employee.name}</h2>
                  <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                    {employee.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{employee.designation}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{employee.userRole}</Badge>
                  <Badge variant={employee.loginAllowed ? "default" : "secondary"}>
                    {employee.loginAllowed ? "Login Allowed" : "Login Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{employee.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information - Simplified to just Designation/Role since Company/Dept are removed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{employee.designation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Territory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Territory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Territory</p>
                  <p className="font-medium">{employee.territory}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="font-medium">{employee.district}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">National ID</p>
                  <p className="font-medium">{employee.nationalId}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{employee.employeeId || "N/A"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Credit Limit</p>
                  <p className="font-medium">{employee.creditLimit || "N/A"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{employee.bloodGroup}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reporting Structure */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Reporting Structure
                </CardTitle>
                {['manager', 'officer', 'rsm'].includes(employee.userRole) && (
                  <Button variant="ghost" size="sm" onClick={() => setIsAssignSupervisorDialogOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Reports To</p>
                  <p className="font-medium">
                    {employee.supervisor ? (
                      <span className="text-primary cursor-pointer hover:underline" onClick={() => router.visit(`/employees/${employee.supervisor?.id}`)}>
                        {employee.supervisor.name} - {employee.supervisor.designation}
                      </span>
                    ) : (
                      "No supervisor assigned"
                    )}
                  </p>
                </div>
              </div>
              {employee.subordinates && employee.subordinates.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-2">Reporting Team ({employee.subordinates.length})</p>
                      <div className="space-y-1">
                        {employee.subordinates.map(sub => (
                          <p
                            key={sub.id}
                            className="font-medium text-primary cursor-pointer hover:underline"
                            onClick={() => router.visit(`/employees/${sub.id}`)}
                          >
                            {sub.name} - {sub.designation}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Set Permissions Dialog */}
        {employee && (
          <UserPermissionDialog
            isOpen={isPermissionsDialogOpen}
            onOpenChange={setIsPermissionsDialogOpen}
            userId={employee.userId}
            userName={employee.name}
            initialPermissions={allPermissions}
            initialUserPermissions={userPermissions}
          />
        )}

        {/* Assign Supervisor Dialog */}
        <Dialog open={isAssignSupervisorDialogOpen} onOpenChange={setIsAssignSupervisorDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Supervisor</DialogTitle>
              <DialogDescription>
                Select a supervisor for {employee?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Select
                  value={selectedSupervisorId?.toString() || "none"}
                  onValueChange={(value: string) => setSelectedSupervisorId(value === "none" ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No supervisor</SelectItem>
                    {employee?.potentialSupervisors.map((sup) => (
                      <SelectItem key={sup.id} value={sup.id.toString()}>
                        {sup.name} {sup.designation ? `- ${sup.designation}` : ''} {sup.role ? `(${sup.role})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {employee?.supervisorId && (
                  <p className="text-sm text-muted-foreground">
                    Current supervisor: {getSupervisorName(employee.supervisorId)}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAssignSupervisorDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleAssignSupervisor} className="w-full sm:w-auto">
                Assign Supervisor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeView;
