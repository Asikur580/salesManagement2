import { useState, useEffect, useCallback } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Shield, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(
    func: F,
    waitFor: number
) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<F>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };

    return debounced as (...args: Parameters<F>) => ReturnType<typeof setTimeout>;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  roles: string[];
  employeeStatus: string;
  designation: string;
  phone: string;
  permissions: string[];
}

interface UsersProps {
  initialUsers: {
    data: UserData[];
    links: { url: string | null; label: string; active: boolean }[];
    meta: {
      current_page: number;
      last_page: number;
      from: number;
      to: number;
      total: number;
    }
  };
  roles: { id: number; name: string }[];
  allPermissions: { id: number; name: string }[];
  filters: {
    search?: string;
    role?: string;
  };
  [key: string]: any;
}

export default function Users() {
  const { initialUsers, roles, allPermissions, filters } = usePage<UsersProps>().props;
  const [users, setUsers] = useState<UserData[]>(initialUsers?.data || []);
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [selectedRole, setSelectedRole] = useState(filters?.role || "all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  // Permission management state
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);

  useEffect(() => {
    if (initialUsers?.data) {
      setUsers(initialUsers.data);
    }
  }, [initialUsers]);

  const fetchUsers = useCallback(
    debounce((search: string, role: string) => {
        setIsLoading(true);
        router.get(
            '/users',
            { 
              search: search || undefined, 
              role: role && role !== "all" ? role : undefined 
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['initialUsers', 'filters'],
                onFinish: () => setIsLoading(false),
            }
        );
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchUsers(value, selectedRole);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    fetchUsers(searchTerm, value);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "destructive";
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleOpenPermissionsDialog = (user: UserData) => {
    setSelectedUser(user);
    if (user.permissions) {
      setUserPermissions(user.permissions);
    } else {
      setUserPermissions([]);
    }
    setIsPermissionDialogOpen(true);
  };

  const handleTogglePermission = (permissionName: string) => {
    setUserPermissions(prev => {
      if (prev.includes(permissionName)) {
        return prev.filter(p => p !== permissionName);
      } else {
        return [...prev, permissionName];
      }
    });
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    setIsPermissionsLoading(true);

    router.post(`/users/${selectedUser.id}/sync-permissions`, {
      permissions: userPermissions
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Permissions updated successfully for ${selectedUser.name}`,
        });
        setIsPermissionDialogOpen(false);
      },
      onError: (errors: any) => {
        toast({
          title: "Error",
          description: (Object.values(errors)[0] as string) || "Failed to update permissions",
          variant: "destructive"
        });
      },
      onFinish: () => setIsPermissionsLoading(false)
    });
  };

  return (
    <DashboardLayout>
      <Head title="Users" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground mt-2">
            View all users, their roles, and employee information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>
              <div className="w-full sm:w-[200px]">
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role, idx) => (
                                <Badge key={idx} variant="outline" className="bg-primary/5">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No role</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.designation}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.employeeStatus)}>
                            {user.employeeStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!user.roles.includes('super-admin') && authUser?.id !== user.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenPermissionsDialog(user)}
                              title="Manage Direct Permissions"
                            >
                              <Shield className="h-4 w-4 text-primary" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {initialUsers?.meta?.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {initialUsers.meta.from || 0} to {initialUsers.meta.to || 0} of{" "}
                  {initialUsers.meta.total} users
                </div>
                <div className="flex gap-2">
                  {initialUsers.links.map((link, i) => {
                    // Skip 'Previous' and 'Next' labels to use icons if preferred,
                    // but simple buttons work well too. Handling labels:
                    let label = link.label;
                    if (label.includes('&laquo;')) label = '«';
                    if (label.includes('&raquo;')) label = '»';

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (link.url) {
                            setIsLoading(true);
                            router.visit(link.url, {
                              preserveScroll: true,
                              only: ['initialUsers'],
                              onFinish: () => setIsLoading(false),
                            });
                          }
                        }}
                        disabled={!link.url || link.active}
                        className={`px-3 py-1 text-sm border rounded hover:bg-muted ${
                          link.active ? "bg-primary text-primary-foreground border-primary" : ""
                        } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                        dangerouslySetInnerHTML={{ __html: label }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manage Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Direct Permissions for {selectedUser?.name}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {isPermissionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allPermissions?.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2 border p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      id={`user-perm-${permission.id}`}
                      checked={userPermissions.includes(permission.name)}
                      onCheckedChange={() => handleTogglePermission(permission.name)}
                    />
                    <Label
                      htmlFor={`user-perm-${permission.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                    >
                      {permission.name}
                    </Label>
                  </div>
                ))}
                {(!allPermissions || allPermissions.length === 0) && (
                  <p className="text-muted-foreground col-span-2 text-center">No permissions found in the system.</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions} disabled={isPermissionsLoading}>
              {isPermissionsLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
