"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { createPasteAction } from "@/src/actions/paste-actions";
import {
  SUPPORTED_LANGUAGES,
  PASTE_EXPIRATION_LABELS,
  type PasteExpiration,
} from "@/src/types/paste";

export function CreatePasteForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result = await createPasteAction(formData);

      if (result.success && result.pasteId) {
        toast.success("Paste created!");
        router.push(`/paste/${result.pasteId}`);
      } else {
        setErrors({ form: result.error ?? "Failed to create paste" });
        toast.error(result.error ?? "Failed to create paste");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="title"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="My awesome snippet"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="language"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Language
          </label>
          <select
            id="language"
            name="language"
            defaultValue="plaintext"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="expiration"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Expiration
          </label>
          <select
            id="expiration"
            name="expiration"
            defaultValue="never"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {(
              Object.entries(PASTE_EXPIRATION_LABELS) as [
                PasteExpiration,
                string,
              ][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="content"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={15}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Paste your code here..."
        />
      </div>

      {errors.form && (
        <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "Creating..." : "Create Paste"}
      </button>
    </form>
  );
}
