import { useTransition, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook for executing server actions with automatic loading state
 * and toast notifications for success/error feedback.
 *
 * Uses React 19 `useTransition` so the action runs as a non-blocking
 * transition and the button/form stays responsive.
 *
 * @example
 * ```ts
 * const { execute, isPending } = useServerAction({
 *     action: updateAssetStatus,
 *     successMessage: "Asset status updated",
 *     onSuccess: () => router.refresh(),
 * });
 *
 * <Button onClick={() => execute({ id, status: "retired" })} disabled={isPending}>
 *     {isPending ? "Saving..." : "Retire Asset"}
 * </Button>
 * ```
 */

interface UseServerActionOptions<TInput, TResult> {
    /** The server action function to call. */
    action: (input: TInput) => Promise<TResult>;
    /** Called after a successful action. */
    onSuccess?: (result: TResult) => void;
    /** Called after a failed action. */
    onError?: (error: Error) => void;
    /** Toast message shown on success. If omitted, no success toast is shown. */
    successMessage?: string;
    /** Toast message shown on error. Falls back to the error message itself. */
    errorMessage?: string;
}

interface UseServerActionReturn<TInput> {
    /** Call this to execute the server action. */
    execute: (input: TInput) => Promise<void>;
    /** Whether the action is currently in-flight. */
    isPending: boolean;
}

export function useServerAction<TInput, TResult = void>(
    options: UseServerActionOptions<TInput, TResult>,
): UseServerActionReturn<TInput> {
    const { action, onSuccess, onError, successMessage, errorMessage } = options;
    const [isPending, startTransition] = useTransition();

    const execute = useCallback(
        async (input: TInput) => {
            startTransition(async () => {
                try {
                    const result = await action(input);
                    if (successMessage) {
                        toast.success(successMessage);
                    }
                    onSuccess?.(result);
                } catch (err) {
                    const error = err instanceof Error ? err : new Error(String(err));
                    toast.error(errorMessage ?? error.message);
                    onError?.(error);
                }
            });
        },
        [action, onSuccess, onError, successMessage, errorMessage],
    );

    return { execute, isPending };
}
