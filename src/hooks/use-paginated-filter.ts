import { useState, useMemo, useEffect, useCallback } from "react";
import { ITEMS_PER_PAGE } from "@/lib/constants";

/**
 * A powerful hook that combines filtering, text search, and pagination.
 *
 * This is the main hook every table page uses. It accepts a list of items,
 * a filter object, a search query, and produces a paginated slice of matching
 * items along with pagination controls.
 *
 * @example
 * ```ts
 * const { paginated, page, totalPages, totalFiltered, setPage, nextPage, prevPage } =
 *     usePaginatedFilter({
 *         items: assets,
 *         filters: { category: "bench", status: "all" },
 *         searchQuery: search,
 *         searchFields: ["serialNumber", "productTypeModel", "customerName"],
 *         filterPredicates: {
 *             category: (item, val) => item.productCategory === val,
 *             status: (item, val) => item.lifecycleStatus === val,
 *         },
 *     });
 * ```
 */

interface UsePaginatedFilterOptions<
    TItem,
    TFilters extends Record<string, string>,
> {
    /** Full unfiltered item list (from server). */
    items: TItem[];
    /** Current filter values. Keys whose value is "all" are skipped. */
    filters: TFilters;
    /** Free-text search query. */
    searchQuery: string;
    /** Which item fields to match the search query against. */
    searchFields: (keyof TItem)[];
    /** Per-filter predicate functions. Omitted keys are ignored. */
    filterPredicates: {
        [K in keyof TFilters]?: (item: TItem, filterValue: TFilters[K]) => boolean;
    };
    /** Rows per page (defaults to ITEMS_PER_PAGE from constants). */
    itemsPerPage?: number;
}

interface UsePaginatedFilterReturn<TItem> {
    /** All items that pass every filter + search (before pagination). */
    filtered: TItem[];
    /** The current page slice of `filtered`. */
    paginated: TItem[];
    /** Current 1-based page number. */
    page: number;
    /** Total number of pages. */
    totalPages: number;
    /** Count of items that pass all filters (= filtered.length). */
    totalFiltered: number;
    /** Jump to a specific page. */
    setPage: (page: number) => void;
    /** Go to next page (no-op if on last page). */
    nextPage: () => void;
    /** Go to previous page (no-op if on first page). */
    prevPage: () => void;
    /** Reset to page 1. */
    resetPage: () => void;
}

export function usePaginatedFilter<
    TItem,
    TFilters extends Record<string, string>,
>(
    options: UsePaginatedFilterOptions<TItem, TFilters>,
): UsePaginatedFilterReturn<TItem> {
    const {
        items,
        filters,
        searchQuery,
        searchFields,
        filterPredicates,
        itemsPerPage = ITEMS_PER_PAGE,
    } = options;

    const [page, setPageRaw] = useState(1);

    // ── Filtered list (memoised) ────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = items;

        // Apply each filter predicate (skip "all" values)
        for (const key of Object.keys(filterPredicates) as (keyof TFilters)[]) {
            const value = filters[key];
            const predicate = filterPredicates[key];
            if (value !== "all" && predicate) {
                result = result.filter((item) => predicate(item, value));
            }
        }

        // Apply text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((item) =>
                searchFields.some((field) => {
                    const val = item[field];
                    if (val == null) return false;
                    return String(val).toLowerCase().includes(q);
                }),
            );
        }

        return result;
    }, [items, filters, searchQuery, searchFields, filterPredicates]);

    // ── Auto-reset to page 1 when filters or search change ──────────────────
    const filtersJson = JSON.stringify(filters);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPageRaw(1);
    }, [filtersJson, searchQuery]);

    // ── Pagination ──────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () =>
            filtered.slice(
                (safePage - 1) * itemsPerPage,
                safePage * itemsPerPage,
            ),
        [filtered, safePage, itemsPerPage],
    );

    const setPage = useCallback(
        (p: number) => setPageRaw(Math.max(1, Math.min(p, totalPages))),
        [totalPages],
    );
    const nextPage = useCallback(
        () => setPageRaw((p) => Math.min(p + 1, totalPages)),
        [totalPages],
    );
    const prevPage = useCallback(
        () => setPageRaw((p) => Math.max(p - 1, 1)),
        [],
    );
    const resetPage = useCallback(() => setPageRaw(1), []);

    return {
        filtered,
        paginated,
        page: safePage,
        totalPages,
        totalFiltered: filtered.length,
        setPage,
        nextPage,
        prevPage,
        resetPage,
    };
}
