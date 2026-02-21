import { useState, useTransition, useCallback } from "react";

/**
 * Hook for managing a detail sheet (slide-over panel) that loads data
 * asynchronously when a table row is clicked.
 *
 * Uses React 19 `useTransition` so the loading state is non-blocking
 * and the UI stays responsive while fetching.
 *
 * @example
 * ```ts
 * const sheet = useSheetDetail(fetchAssetDetail);
 *
 * // In table row onClick:
 * <TableRow onClick={() => sheet.open(asset.id)}>
 *
 * // In Sheet component:
 * <Sheet open={sheet.isOpen} onOpenChange={(v) => !v && sheet.close()}>
 *     {sheet.isLoading ? <Skeleton /> : <Detail data={sheet.detail} />}
 * </Sheet>
 * ```
 */
export function useSheetDetail<TDetail>(
    fetchDetail: (id: string) => Promise<TDetail | null>,
) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<TDetail | null>(null);
    const [isPending, startTransition] = useTransition();

    const open = useCallback(
        (id: string) => {
            setSelectedId(id);
            startTransition(async () => {
                const data = await fetchDetail(id);
                setDetail(data);
            });
        },
        [fetchDetail],
    );

    const close = useCallback(() => {
        setSelectedId(null);
        setDetail(null);
    }, []);

    return {
        /** The ID of the currently selected row (or null). */
        selectedId,
        /** The fetched detail record (null until loaded). */
        detail,
        /** Whether the sheet should be visible. */
        isOpen: selectedId !== null,
        /** Whether a fetch is in progress. */
        isLoading: isPending,
        /** Open the sheet and start fetching detail for the given ID. */
        open,
        /** Close the sheet and clear state. */
        close,
    } as const;
}
