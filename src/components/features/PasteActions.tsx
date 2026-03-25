"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  deletePasteAction,
  toggleVisibilityAction,
} from "@/src/actions/paste-actions";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface PasteActionsProps {
  pasteId: string;
  isPublic: boolean;
}

export function PasteActions({ pasteId, isPublic }: PasteActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePasteAction(pasteId);

      if (result.success) {
        toast.success("Paste deleted");
        // Force redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  }

  function handleToggleVisibility() {
    startTransition(async () => {
      const result = await toggleVisibilityAction(pasteId);

      if (result.success) {
        toast.success(
          isPublic ? "Paste is now private" : "Paste is now public",
        );
        // We use window.location.reload() or router.refresh() but reload is cleaner for public/private toggle
        window.location.reload();
      } else {
        toast.error(result.error ?? "Failed to update visibility");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleVisibility}
        disabled={isPending}
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {isPublic ? (
          <>
            <EyeOff className="h-4 w-4" />
            <span className="hidden sm:inline">Make Private</span>
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Make Public</span>
          </>
        )}
      </button>

      <button
        onClick={handleDelete}
        disabled={isPending}
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden lg:inline">Delete</span>
      </button>
    </div>
  );
}
