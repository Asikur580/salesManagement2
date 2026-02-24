import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { router } from "@inertiajs/react";

interface UserPermissionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  initialPermissions: Permission[];
  initialUserPermissions: string[];
}

interface Permission {
  id: number;
  name: string;
  guard_name: string;
  description?: string;
  group?: string;
}

export const UserPermissionDialog = ({
  isOpen,
  onOpenChange,
  userId,
  userName,
  initialPermissions,
  initialUserPermissions,
}: UserPermissionDialogProps) => {
  const { toast } = useToast();
  
  const [allPermissions, setAllPermissions] = useState<Permission[]>(initialPermissions || []);
  const [userPermissions, setUserPermissions] = useState<string[]>(initialUserPermissions || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialPermissions) setAllPermissions(initialPermissions);
  }, [initialPermissions]);

  useEffect(() => {
    if (initialUserPermissions) setUserPermissions(initialUserPermissions);
  }, [initialUserPermissions]);

  const handlePermissionToggle = (permissionName: string) => {
    setUserPermissions(prev => {
      if (prev.includes(permissionName)) {
        return prev.filter(p => p !== permissionName);
      } else {
        return [...prev, permissionName];
      }
    });
  };

  const handleGroupToggle = (group: string, permissionsInGroup: Permission[]) => {
    const allGroupPermNames = permissionsInGroup.map(p => p.name);
    const allSelected = allGroupPermNames.every(name => userPermissions.includes(name));

    if (allSelected) {
      setUserPermissions(prev => prev.filter(name => !allGroupPermNames.includes(name)));
    } else {
      setUserPermissions(prev => {
        const otherPermissions = prev.filter(name => !allGroupPermNames.includes(name));
        return [...otherPermissions, ...allGroupPermNames];
      });
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    router.post(`/users/${userId}/sync-permissions`, { permissions: userPermissions }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Permissions for ${userName} updated successfully`,
        });
        onOpenChange(false);
      },
      onError: (errors: any) => {
        toast({
          title: "Error",
          description: Object.values(errors)[0] as string || "Failed to update permissions",
          variant: "destructive",
        });
      },
      onFinish: () => setIsSaving(false)
    });
  };

  // Group permissions for display
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const group = perm.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const sortedGroups = Object.keys(groupedPermissions).sort();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Manage Permissions
          </DialogTitle>
          <DialogDescription>
            Configure access rights directly for <span className="font-medium text-foreground">{userName}</span>.
            These permissions apply in addition to their role.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">
              {sortedGroups.map(group => {
                const groupPerms = groupedPermissions[group];
                const allSelected = groupPerms.every(p => userPermissions.includes(p.name));
                const someSelected = groupPerms.some(p => userPermissions.includes(p.name));
                
                return (
                  <div key={group} className="space-y-3">
                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id={`group-${group}`}
                          checked={allSelected ? true : (someSelected ? "indeterminate" : false)}
                          onCheckedChange={() => handleGroupToggle(group, groupPerms)}
                        />
                        <Label htmlFor={`group-${group}`} className="font-semibold text-sm uppercase tracking-wider cursor-pointer">
                          {group} Management
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {groupPerms.filter(p => userPermissions.includes(p.name)).length} / {groupPerms.length}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-2">
                      {groupPerms.map(perm => (
                        <div key={perm.id} className="flex items-start space-x-2 border p-2 rounded hover:bg-muted/20 transition-colors">
                          <Checkbox 
                            id={`perm-${perm.id}`}
                            checked={userPermissions.includes(perm.name)}
                            onCheckedChange={() => handlePermissionToggle(perm.name)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label 
                              htmlFor={`perm-${perm.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {perm.name}
                            </Label>
                            {perm.description && (
                              <p className="text-[0.8rem] text-muted-foreground">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>
          </ScrollArea>

        <DialogFooter className="p-6 pt-2 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
