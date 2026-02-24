import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Shield, ArrowUp, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollWrapper } from "@/components/ui/scroll-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleCard } from "@/components/roles/RoleCard";
import { useAuth } from "@/hooks/useAuth";

interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  description?: string;
  permissions?: { id: number; name: string }[];
  userCount?: number;
}

interface Permission {
  id: number;
  name: string;
}

import { router, usePage } from "@inertiajs/react";

interface RolesProps {
  initialRoles: Role[];
  initialPermissions: Permission[];
  filters: any;
}

export default function Roles({ initialRoles, initialPermissions, filters }: RolesProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters?.search || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  
  // Permission management state
  const [allPermissions, setAllPermissions] = useState<Permission[]>(initialPermissions || []);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Update permissions when prop changes
  useEffect(() => {
    if (initialPermissions) {
      setAllPermissions(initialPermissions);
    }
  }, [initialPermissions]);

  // Permission helper function
  const hasPermission = (permission: string): boolean => {
    const result = user?.permissions?.includes(permission) || false;   
    return result;
  };

  const handleRefresh = () => {
    router.reload({
      onStart: () => setIsLoading(true),
      onFinish: () => setIsLoading(false),
    });
  };

  // Effect to update local roles when prop changes
  useEffect(() => {
    if (initialRoles) {
      setRoles(initialRoles);
    }
  }, [initialRoles]);

  // Scroll to top detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    router.get('/roles', { search: value }, { preserveState: true, replace: true });
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
      });
    } else {
      setSelectedRole(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRole(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmit = async () => {
    // Check permissions
    const requiredPermission = selectedRole ? 'role.update' : 'role.create';
    if (!hasPermission(requiredPermission)) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to ${selectedRole ? 'update' : 'create'} roles.`,
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    if (selectedRole) {
      router.put(`/roles/${selectedRole.id}`, { name: formData.name }, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Role updated successfully",
          });
          handleCloseDialog();
        },
        onError: (errors: any) => {
          toast({
            title: "Error",
            description: (Object.values(errors)[0] as string) || "Failed to update role",
            variant: "destructive",
          });
        },
        onFinish: () => setIsLoading(false)
      });
    } else {
      router.post('/roles', { name: formData.name }, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Role created successfully",
          });
          handleCloseDialog();
        },
        onError: (errors: any) => {
          toast({
            title: "Error",
            description: (Object.values(errors)[0] as string) || "Failed to create role",
            variant: "destructive",
          });
        },
        onFinish: () => setIsLoading(false)
      });
    }
  };

  const handleOpenDeleteDialog = (role: Role) => {
    if (role.name.toLowerCase() === 'super-admin' || role.name.toLowerCase() === 'admin') {
      toast({
        title: "Action Not Allowed",
        description: "System roles cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!hasPermission('role.delete')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete roles.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    if (!selectedRole) return;

    setIsLoading(true);
    router.delete(`/roles/${selectedRole.id}`, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Role deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedRole(null);
      },
      onError: (errors: any) => {
        toast({
          title: "Error",
          description: (Object.values(errors)[0] as string) || "Failed to delete role",
          variant: "destructive",
        });
      },
      onFinish: () => setIsLoading(false)
    });
  };

  // Permission Management Functions

  const handleOpenPermissionsDialog = (role: Role) => {
      setSelectedRole(role);
      setIsPermissionDialogOpen(true);
      
      if (role.permissions) {
          setRolePermissions(role.permissions.map(p => p.name));
      } else {
          setRolePermissions([]);
      }
  };

  const handleTogglePermission = (permissionName: string) => {
      setRolePermissions(prev => {
          if (prev.includes(permissionName)) {
              return prev.filter(p => p !== permissionName);
          } else {
              return [...prev, permissionName];
          }
      });
  };

  const handleSavePermissions = async () => {
      if (!selectedRole) return;
      setIsPermissionsLoading(true);

      router.post(`/roles/${selectedRole.id}/sync-permissions`, {
          permissions: rolePermissions
      }, {
          onSuccess: () => {
              toast({
                  title: "Success",
                  description: "Role permissions updated successfully",
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manage Roles</h1>
            <p className="text-muted-foreground mt-1">
              View and manage system roles
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
             </Button>
             {hasPermission('role.create') && (
               <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
              </Button>
             )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <ScrollWrapper>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                             Loading roles...
                        </TableCell>
                    </TableRow>
                  ) : paginatedRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No roles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                            {role.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {role.name}
                            {role.name === 'super-admin' && (
                                <Badge variant="outline" className="text-xs">System</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {role.name.toLowerCase() !== 'super-admin' && role.name.toLowerCase() !== 'admin' && hasPermission('role.update') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(role)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {role.name.toLowerCase() !== 'super-admin' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenPermissionsDialog(role)}
                                  title="Manage Permissions"
                                >
                                  <Shield className="h-4 w-4 text-blue-500" />
                                </Button>
                                {role.name.toLowerCase() !== 'admin' && hasPermission('role.delete') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenDeleteDialog(role)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollWrapper>
        </div>
        
        {/* Mobile View Placeholder - can use simplified list instead of Table */}
         <div className="md:hidden space-y-4">
             {isLoading ? (
                 <p className="text-center py-4">Loading...</p>
             ) : paginatedRoles.map((role) => (
                 <div key={role.id} className="bg-card p-4 rounded-lg border space-y-2">
                     <div className="flex justify-between items-start">
                          <div>
                              <h3 className="font-bold">{role.name}</h3>
                          </div>
                         <Badge variant="outline">ID: {role.id}</Badge>
                     </div>
                 </div>
             ))}
         </div>


        {/* Pagination */}
        {filteredRoles.length > 0 && (
          <div className="sticky bottom-0 bg-background border-t mt-4 pt-4 pb-2 z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                <span className="text-xs sm:text-sm text-muted-foreground">Rows per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {filteredRoles.length === 0
                    ? "No results"
                    : `${startIndex + 1}-${Math.min(endIndex, filteredRoles.length)} of ${filteredRoles.length}`}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Role" : "Add New Role"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                placeholder="Enter role name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            {/* Description not in API yet, kept for future usage or can be hidden */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter role description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {selectedRole ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the role "{selectedRole?.name}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Manage Permissions for {selectedRole?.name}</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto py-4">
                {isPermissionsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground"/>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2 border p-2 rounded hover:bg-muted/50">
                                <Checkbox 
                                    id={`perm-${permission.id}`} 
                                    checked={rolePermissions.includes(permission.name)}
                                    onCheckedChange={() => handleTogglePermission(permission.name)}
                                />
                                <Label 
                                    htmlFor={`perm-${permission.id}`} 
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                >
                                    {permission.name}
                                </Label>
                            </div>
                        ))}
                        {allPermissions.length === 0 && (
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

      {/* Scroll to Top Button - Mobile Only */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-20 right-4 md:hidden z-50 h-12 w-12 rounded-full shadow-lg"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </DashboardLayout>
  );
}
