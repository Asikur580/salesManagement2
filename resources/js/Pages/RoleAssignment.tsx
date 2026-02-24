import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { router } from "@inertiajs/react";

export default function RoleAssignment() {
  const { user } = useAuth();
  const { toast } = useToast();
  // const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (user && !user.permissions?.includes('role.view')) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view role assignments.",
        variant: "destructive",
      });
      router.visit("/");
    } else if (user) {
        setAuthorized(true);
    }
  }, [user, toast]);

  if (!authorized) {
      return null; // Or a loading spinner
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Role Assignment</h1>
          <p className="text-muted-foreground mt-1">
            Assign roles to users
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Role assignment feature coming soon...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
