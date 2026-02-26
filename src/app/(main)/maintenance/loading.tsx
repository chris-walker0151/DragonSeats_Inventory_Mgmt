import { Skeleton } from "@/components/ui/skeleton";

export default function MaintenanceLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-[160px]" />
                <Skeleton className="h-9 w-[150px]" />
                <Skeleton className="h-9 w-[170px]" />
            </div>
            <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </div>
    );
}
