import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tabular-nums">404</h1>
                    <p className="text-sm text-muted-foreground">
                        This page doesn&apos;t exist in the inventory system.
                    </p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
