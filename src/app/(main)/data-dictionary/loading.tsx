import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-1 h-4 w-80" />
            </div>
            {/* Search bar */}
            <Skeleton className="h-9 w-64" />
            {/* Tabs */}
            <Skeleton className="h-9 w-56" />
            {/* Collapsible cards */}
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}
