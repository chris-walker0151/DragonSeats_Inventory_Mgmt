"use client";

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
import { SKU_CONVENTION } from "@/lib/data-dictionary/schema-reference";

export function SkuConventionCard() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Format Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">SKU Format</CardTitle>
                    <CardDescription>
                        Standard naming convention for all Dragon Seats products
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4 text-center">
                        <p className="font-mono text-lg font-bold tracking-wider">
                            {SKU_CONVENTION.format}
                        </p>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                            <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
                                DS
                            </Badge>
                            <span className="text-muted-foreground">
                                {SKU_CONVENTION.prefixDescription}
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
                                CAT
                            </Badge>
                            <span className="text-muted-foreground">
                                2-letter category code (see table below)
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
                                TYPE
                            </Badge>
                            <span className="text-muted-foreground">
                                Product type within the category
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
                                SPEC
                            </Badge>
                            <span className="text-muted-foreground">
                                Specification variant (optional)
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Category Codes Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Category Codes</CardTitle>
                    <CardDescription>
                        2-letter codes used in the SKU format
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Code</TableHead>
                                <TableHead>Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {SKU_CONVENTION.categoryCodes.map((cc) => (
                                <TableRow key={cc.code}>
                                    <TableCell className="font-mono text-xs font-bold">
                                        {cc.code}
                                    </TableCell>
                                    <TableCell className="text-sm">{cc.category}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Examples Card */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Examples</CardTitle>
                    <CardDescription>
                        Reference examples showing the SKU convention in practice
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>SKU</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {SKU_CONVENTION.examples.map((ex) => (
                                <TableRow key={ex.sku}>
                                    <TableCell className="font-mono text-xs font-bold">
                                        {ex.sku}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {ex.description}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Rules Card */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">SKU Rules</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {SKU_CONVENTION.rules.map((rule, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {rule}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
