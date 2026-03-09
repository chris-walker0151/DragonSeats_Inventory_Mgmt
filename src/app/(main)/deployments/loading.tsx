import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-44" />
                <Skeleton className="mt-1 h-4 w-80" />
            </div>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[76px] w-full rounded-xl" />
                ))}
            </div>
            {/* Filters + action button */}
            <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
            </div>
            {/* Table */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                ))}
            </div>
        </div>
    );
}
