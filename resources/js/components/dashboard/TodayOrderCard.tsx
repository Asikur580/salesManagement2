import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { router } from "@inertiajs/react";

interface TodayOrderCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href: string;
  color?: "primary" | "success" | "warning" | "destructive";
}

export function TodayOrderCard({ 
  title, 
  value, 
  icon: Icon, 
  href,
  color = "primary" 
}: TodayOrderCardProps) {
  // const navigate = useNavigate();

  const colorClasses = {
    primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    success: "bg-green-500/10 text-green-600 group-hover:bg-green-500 group-hover:text-white",
    warning: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
    destructive: "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground",
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50"
      onClick={() => router.visit(href)}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
