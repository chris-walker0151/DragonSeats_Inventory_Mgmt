import { Suspense } from "react";
import {
    fetchDashboardFleetMatrix,
    fetchDashboardLocationSummary,
    fetchDashboardBrandingSummary,
} from "@/lib/serialized-assets/queries";
import { FleetMatrixCard } from "./fleet-matrix-card";
import { LocationSummaryCard } from "./location-summary-card";
import { BrandingSummaryCard } from "./branding-summary-card";
import { DashboardSkeleton } from "./loading";

export const dynamic = "force-dynamic";
export const metadata = {
    title: "Dragon Seats — Dashboard",
};

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Fleet overview and inventory status
                </p>
            </div>
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent />
            </Suspense>
        </div>
    );
}

async function DashboardContent() {
    const [fleetMatrix, locationSummary, brandingSummary] = await Promise.all([
        fetchDashboardFleetMatrix(),
        fetchDashboardLocationSummary(),
        fetchDashboardBrandingSummary(),
    ]);

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <FleetMatrixCard data={fleetMatrix} className="xl:col-span-2" />
            <LocationSummaryCard data={locationSummary} />
            <BrandingSummaryCard data={brandingSummary} />
        </div>
    );
}
