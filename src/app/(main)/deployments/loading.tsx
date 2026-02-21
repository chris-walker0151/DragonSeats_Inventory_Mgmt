import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-44" />
                <Skeleton className="mt-1 h-4 w-72" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                ))}
            </div>
        </div>
    );
}
