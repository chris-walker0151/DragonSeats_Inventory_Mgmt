import { useState, useCallback } from "react";

/**
 * Lightweight hook for managing multiple filter state values with a single
 * updater, plus a co-located search string.
 *
 * Every table page typically needs N dropdown filters and one text search.
 * This hook keeps them in a single, type-safe state object so the shell
 * component doesn't need a separate `useState` for every dropdown.
 *
 * @example
 * ```ts
 * const { filters, setFilter, resetFilters, search, setSearch } = useFilters({
 *     category: "all",
 *     status: "all",
 *     location: "all",
 * });
 * ```
 */
export function useFilters<T extends Record<string, string>>(initialFilters: T) {
    const [filters, setFilters] = useState<T>(initialFilters);
    const [search, setSearch] = useState("");

    /** Update a single filter key immutably. */
    const setFilter = useCallback(
        <K extends keyof T>(key: K, value: T[K]) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        [],
    );

    /** Reset every filter back to its initial value and clear search. */
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
        setSearch("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { filters, setFilter, resetFilters, search, setSearch } as const;
}
