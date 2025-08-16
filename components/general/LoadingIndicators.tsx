import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function LoadingIndicator({ className }: { className?: string }) {
   return (
      <div className={cn(`flex flex-col items-center justify-center gap-2 p-4`, className)}>
         <Loader2 className="mx-auto animate-spin" />
         Loading...
      </div>
   );
}
