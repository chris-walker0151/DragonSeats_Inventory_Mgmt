"use client";

import { useState, useCallback, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";
import type { ImportColumnMapping, ImportPreviewRow, ImportResult } from "@/lib/import/types";
import { parseSpreadsheet, validateAndMapRows, countErrors } from "@/lib/import/parser";
import { downloadImportTemplate } from "@/lib/import/template";

type Step = "upload" | "preview" | "importing" | "results";

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    columns: ImportColumnMapping[];
    templateFileName: string;
    onImport: (rows: Record<string, unknown>[]) => Promise<ImportResult>;
}

export function ImportDialog({
    open,
    onClose,
    title,
    description,
    columns,
    templateFileName,
    onImport,
}: ImportDialogProps) {
    const [step, setStep] = useState<Step>("upload");
    const [fileName, setFileName] = useState("");
    const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const reset = useCallback(() => {
        setStep("upload");
        setFileName("");
        setPreviewRows([]);
        setResult(null);
        setError(null);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setError(null);
            setFileName(file.name);

            try {
                const rawRows = await parseSpreadsheet(file);
                if (rawRows.length === 0) {
                    setError("The file contains no data rows.");
                    return;
                }
                const mapped = validateAndMapRows(rawRows, columns);
                setPreviewRows(mapped);
                setStep("preview");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to parse file");
            }
        },
        [columns],
    );

    const handleConfirmImport = useCallback(() => {
        const validRows = previewRows
            .filter((r) => r.errors.length === 0)
            .map((r) => r.data);

        if (validRows.length === 0) {
            setError("No valid rows to import.");
            return;
        }

        setStep("importing");
        startTransition(async () => {
            try {
                const importResult = await onImport(validRows);
                setResult(importResult);
                setStep("results");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Import failed");
                setStep("preview");
            }
        });
    }, [previewRows, onImport]);

    const { valid, invalid } = previewRows.length > 0 ? countErrors(previewRows) : { valid: 0, invalid: 0 };
    const previewColumns = columns.slice(0, 5); // Show first 5 columns in preview

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" showCloseButton={step !== "importing"}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {/* Step 1: Upload */}
                {step === "upload" && (
                    <div className="space-y-4">
                        <label
                            htmlFor="import-file"
                            className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        >
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <div className="text-center">
                                <p className="font-medium">
                                    {fileName || "Click to upload a file"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Supports .xlsx, .xls, and .csv files
                                </p>
                            </div>
                            <input
                                id="import-file"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>

                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => downloadImportTemplate(columns, templateFileName)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>

                        <div className="rounded-md bg-muted/50 p-3">
                            <p className="text-xs font-medium mb-1">Expected columns:</p>
                            <div className="flex flex-wrap gap-1">
                                {columns.map((col) => (
                                    <Badge
                                        key={col.targetField}
                                        variant={col.required ? "default" : "secondary"}
                                        className="text-[10px]"
                                    >
                                        {col.sourceColumn}
                                        {col.required && " *"}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === "preview" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">{fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {previewRows.length} row{previewRows.length !== 1 && "s"} found
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="default" className="text-xs">
                                    {valid} valid
                                </Badge>
                                {invalid > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        {invalid} error{invalid !== 1 && "s"}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border overflow-x-auto max-h-60">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-10">#</TableHead>
                                        {previewColumns.map((col) => (
                                            <TableHead key={col.targetField} className="text-xs">
                                                {col.sourceColumn}
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-xs">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewRows.slice(0, 20).map((row) => (
                                        <TableRow
                                            key={row.rowNumber}
                                            className={row.errors.length > 0 ? "bg-destructive/5" : ""}
                                        >
                                            <TableCell className="text-xs text-muted-foreground">
                                                {row.rowNumber}
                                            </TableCell>
                                            {previewColumns.map((col) => (
                                                <TableCell key={col.targetField} className="text-xs max-w-32 truncate">
                                                    {String(row.data[col.targetField] ?? "—")}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                {row.errors.length > 0 ? (
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        {row.errors.length} error{row.errors.length !== 1 && "s"}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="text-[10px] bg-emerald-100 text-emerald-800">
                                                        OK
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {previewRows.length > 20 && (
                            <p className="text-xs text-muted-foreground text-center">
                                Showing first 20 of {previewRows.length} rows
                            </p>
                        )}

                        {/* Show first few errors if any */}
                        {invalid > 0 && (
                            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 space-y-1">
                                <p className="text-xs font-medium text-destructive">Validation Errors:</p>
                                {previewRows
                                    .flatMap((r) => r.errors)
                                    .slice(0, 5)
                                    .map((err, i) => (
                                        <p key={i} className="text-xs text-destructive/80">
                                            Row {err.row}, {err.column}: {err.message}
                                        </p>
                                    ))}
                                {previewRows.flatMap((r) => r.errors).length > 5 && (
                                    <p className="text-xs text-destructive/60">
                                        ...and {previewRows.flatMap((r) => r.errors).length - 5} more
                                    </p>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => { reset(); }}>
                                Back
                            </Button>
                            <Button onClick={handleConfirmImport} disabled={valid === 0}>
                                Import {valid} Row{valid !== 1 && "s"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* Step 3: Importing */}
                {step === "importing" && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Importing {valid} row{valid !== 1 && "s"}...
                        </p>
                    </div>
                )}

                {/* Step 4: Results */}
                {step === "results" && result && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-3 py-4">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            <p className="font-medium">Import Complete</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-md border p-3">
                                <p className="text-2xl font-bold text-emerald-600">{result.created}</p>
                                <p className="text-xs text-muted-foreground">Created</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                                <p className="text-xs text-muted-foreground">Updated</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-2xl font-bold text-muted-foreground">{result.skipped}</p>
                                <p className="text-xs text-muted-foreground">Skipped</p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 space-y-1">
                                <p className="text-xs font-medium text-destructive">
                                    {result.errors.length} error{result.errors.length !== 1 && "s"} during import:
                                </p>
                                {result.errors.slice(0, 5).map((err, i) => (
                                    <p key={i} className="text-xs text-destructive/80">
                                        Row {err.row}: {err.message}
                                    </p>
                                ))}
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={handleClose}>Done</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
