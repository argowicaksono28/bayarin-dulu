import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft } from "lucide-react"

export default function GroupLoading() {
  return (
    <div className="min-h-screen">
      {/* Group header skeleton */}
      <div className="px-4 pt-4 pb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center text-muted-foreground mr-1">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <div>
              <Skeleton className="h-6 w-40 mb-1.5" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-1 h-10 w-full p-1 bg-card border border-border/50 rounded-lg mb-4">
          <Skeleton className="h-full w-full rounded-md" />
          <Skeleton className="h-full w-full rounded-md" />
        </div>
        
        <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
