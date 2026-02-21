"use client";

import { useState } from "react";
import { TABLES, ENUMS } from "@/lib/data-dictionary/schema-reference";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Database, List } from "lucide-react";

export function DataDictionaryShell() {
    const [search, setSearch] = useState("");

    const q = search.toLowerCase();

    // Filter tables and their columns
    const filteredTables = TABLES.map((table) => {
        if (!q) return table;
        const matchesTable = table.tableName.toLowerCase().includes(q) ||
            table.description.toLowerCase().includes(q);
        if (matchesTable) return table;
        const matchedColumns = table.columns.filter(
            (col) =>
                col.name.toLowerCase().includes(q) ||
                col.type.toLowerCase().includes(q) ||
                col.description.toLowerCase().includes(q),
        );
        if (matchedColumns.length > 0) {
            return { ...table, columns: matchedColumns };
        }
        return null;
    }).filter(Boolean) as typeof TABLES;

    // Filter enums
    const filteredEnums = ENUMS.filter((e) => {
        if (!q) return true;
        if (e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)) return true;
        return e.values.some(
            (v) =>
                v.value.toLowerCase().includes(q) ||
                v.label.toLowerCase().includes(q) ||
                v.description.toLowerCase().includes(q),
        );
    });

    return (
        <div className="space-y-4">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search tables, columns, enums..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            <Tabs defaultValue="tables" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="tables" className="gap-1.5">
                        <Database className="h-3.5 w-3.5" />
                        Tables ({filteredTables.length})
                    </TabsTrigger>
                    <TabsTrigger value="enums" className="gap-1.5">
                        <List className="h-3.5 w-3.5" />
                        Enums ({filteredEnums.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tables" className="space-y-6">
                    {filteredTables.length === 0 ? (
                        <div className="rounded-md border p-12 text-center">
                            <p className="text-muted-foreground">No tables match your search.</p>
                        </div>
                    ) : (
                        filteredTables.map((table) => (
                            <Card key={table.tableName}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Badge variant="secondary" className="font-mono text-[10px]">
                                            {table.tableName}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {table.columns.length} columns
                                        </span>
                                    </CardTitle>
                                    <CardDescription>{table.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="px-2 sm:px-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-[160px]">Column</TableHead>
                                                <TableHead className="w-[120px]">Type</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="w-[60px] text-center">Req</TableHead>
                                                <TableHead className="w-[160px]">Example</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {table.columns.map((col) => (
                                                <TableRow key={col.name}>
                                                    <TableCell className="font-mono text-xs font-medium">
                                                        {col.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={col.type.includes("FK") ? "info" : "secondary"}
                                                            className="text-[10px]"
                                                        >
                                                            {col.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {col.description}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {col.required ? (
                                                            <span className="text-xs font-medium text-foreground">✓</span>
                                                        ) : (
                                                            <span className="text-muted-foreground/40">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                                                        {col.example}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="enums" className="space-y-6">
                    {filteredEnums.length === 0 ? (
                        <div className="rounded-md border p-12 text-center">
                            <p className="text-muted-foreground">No enums match your search.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {filteredEnums.map((enumDef) => (
                                <Card key={enumDef.name}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Badge variant="outline" className="font-mono text-[10px]">
                                                {enumDef.name}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>{enumDef.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {enumDef.values.map((v) => (
                                                <div
                                                    key={v.value}
                                                    className="flex items-start gap-3 rounded-lg border p-2.5"
                                                >
                                                    <Badge
                                                        variant="secondary"
                                                        className="font-mono text-[10px] shrink-0 mt-0.5"
                                                    >
                                                        {v.value}
                                                    </Badge>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium">{v.label}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {v.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
