import { fetchCustomersList } from "@/lib/customers/queries";
import { CustomersShell } from "./customers-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dragon Seats — Customers" };

export default async function CustomersPage() {
    const customers = await fetchCustomersList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                <p className="text-sm text-muted-foreground">
                    NFL and NCAA team accounts and deployments
                </p>
            </div>
            <CustomersShell customers={customers} />
        </div>
    );
}
