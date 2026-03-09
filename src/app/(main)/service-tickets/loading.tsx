import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-52" />
                <Skeleton className="mt-1 h-4 w-80" />
            </div>

            {/* Summary cards skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>

            {/* Action bar skeleton */}
            <div className="flex justify-end">
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Filter bar skeleton */}
            <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-28" />
            </div>

            {/* Table skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                ))}
            </div>
        </div>
    );
}
