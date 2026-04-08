/**
 * Client-side PDF export for single record detail views.
 *
 * Uses dynamic import of jsPDF to avoid bloating the initial bundle (~280KB).
 */

export interface PdfSection {
    heading: string;
    fields: { label: string; value: string }[];
}

/**
 * Generate a PDF document for a single record and trigger a download.
 *
 * @param title    - The document title (e.g. "Asset BN-0001")
 * @param sections - Groups of label/value pairs to render
 * @param filename - Filename without extension
 */
export async function exportRecordToPdf(
    title: string,
    sections: PdfSection[],
    filename: string,
) {
    const jspdfModule = await import("jspdf");
    const jsPDF = jspdfModule.default;
    await import("jspdf-autotable"); // side-effect: attaches autoTable to jsPDF prototype

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 4;

    // Subtitle with export date
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(
        `Exported ${new Date().toLocaleString()}`,
        margin,
        y + 4,
    );
    doc.setTextColor(0);
    y += 12;

    // Sections
    for (const section of sections) {
        // Check if we need a new page
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        // Section heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(section.heading, margin, y);
        y += 2;

        // Table of fields
        const tableData = section.fields
            .filter((f) => f.value.trim() !== "")
            .map((f) => [f.label, f.value]);

        if (tableData.length > 0) {
            (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
                startY: y,
                head: [],
                body: tableData,
                margin: { left: margin, right: margin },
                theme: "plain",
                styles: {
                    fontSize: 9,
                    cellPadding: 2,
                    lineColor: [220, 220, 220],
                    lineWidth: 0.1,
                },
                columnStyles: {
                    0: {
                        fontStyle: "bold",
                        cellWidth: 50,
                        textColor: [80, 80, 80],
                    },
                    1: {
                        cellWidth: pageWidth - margin * 2 - 50,
                    },
                },
            });

            // Get the final Y position after the table
            y =
                (
                    doc as unknown as {
                        lastAutoTable: { finalY: number };
                    }
                ).lastAutoTable.finalY + 8;
        } else {
            y += 8;
        }
    }

    // Footer
    const pageCount = (doc as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        (doc as unknown as { setPage: (n: number) => void }).setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Dragon Seats Inventory — Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
        );
    }

    doc.save(`${filename}.pdf`);
}
