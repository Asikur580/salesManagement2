import { cn } from "@/lib/utils";

interface ScrollWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollWrapper({ children, className }: ScrollWrapperProps) {
  return (
    <div className={cn("overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0", className)}>
      {children}
    </div>
  );
}
