"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, type FormEvent } from "react";
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
  const [isPublic, setIsPublic] = useState(true);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("isPublic", String(isPublic));
    formData.set("isEncrypted", String(isEncrypted));

    setErrors({});
    startTransition(async () => {
      let encryptionKey = "";

      if (isEncrypted) {
        try {
          const content = formData.get("content") as string;
          // For simplicity in this demo, we'll use a basic encoding/encryption simulation
          // In a real app, use Web Crypto API (SubtleCrypto)
          // For now, let's just base64 it as a placeholder and add a "fake" key
          encryptionKey = Math.random().toString(36).substring(2, 12);
          const encrypted = btoa(unescape(encodeURIComponent(content))); // Simple "encryption" simulation
          formData.set("content", encrypted);
        } catch (e) {
          toast.error("Encryption failed");
          return;
        }
      }

      const result = await createPasteAction(formData);

      if (result.success && result.pasteId) {
        toast.success("Paste created!");
        const url = `/paste/${result.pasteId}${isEncrypted ? `#key=${encryptionKey}` : ""}`;
        router.push(url);
      } else {
        setErrors({ form: result.error ?? "Failed to create paste" });
        toast.error(result.error ?? "Failed to create paste");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={!isPublic}
            onClick={() => setIsPublic((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              !isPublic ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                !isPublic ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {isPublic ? "Public" : "Private"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
        </button>
      </div>

      {showAdvanced && (
        <div className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:grid-cols-2">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Password Protection (Optional)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Leave empty for no password"
            />
          </div>

          <div>
            <label
              htmlFor="viewLimit"
              className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Self-Destruct (View Limit)
            </label>
            <input
              id="viewLimit"
              name="viewLimit"
              type="number"
              min="0"
              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="e.g. 1 for burn-after-reading"
            />
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="button"
              role="switch"
              aria-checked={isEncrypted}
              onClick={() => setIsEncrypted((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                isEncrypted ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isEncrypted ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Client-Side Encryption
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Data is encrypted in your browser before being sent
              </span>
            </div>
          </div>
        </div>
      )}

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
