import { DataDictionaryShell } from "./data-dictionary-shell";

export const metadata = { title: "Dragon Seats — Data Dictionary" };

export default function DataDictionaryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Data Dictionary</h1>
                <p className="text-sm text-muted-foreground">
                    Schema reference for all tables, columns, and enums
                </p>
            </div>
            <DataDictionaryShell />
        </div>
    );
}
