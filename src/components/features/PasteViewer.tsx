"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Unlock, Globe, AlertTriangle } from "lucide-react";
import { CodeBlock } from "@/src/components/features/CodeBlock";
import { getPasteContentAction } from "@/src/actions/paste-actions";

interface PasteViewerProps {
  id: string;
  title: string;
  language: string;
  isEncrypted: boolean;
  hasPassword: boolean;
  initialContent?: string | null;
}

export function PasteViewer({
  id,
  language,
  isEncrypted,
  hasPassword,
  initialContent,
}: PasteViewerProps) {
  const [content, setContent] = useState<string | null>(initialContent ?? null);
  const [isLocked, setIsLocked] = useState(hasPassword && !initialContent);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  // Handle client-side decryption if key is in hash
  useEffect(() => {
    if (content && isEncrypted) {
      const hash = window.location.hash;
      if (hash.startsWith("#key=")) {
        try {
          // In our "simulation", encryption was just Base64
          // Let's reverse it. In real app, search for SubtleCrypto.
          const decrypted = decodeURIComponent(escape(atob(content)));
          if (decrypted !== content) {
            setContent(decrypted);
          }
        } catch {
          toast.error("Failed to decrypt content. Key might be invalid.");
        }
      } else {
        toast.info("This paste is encrypted. You need a key in the URL to read it.");
      }
    }
  }, [content, isEncrypted]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await getPasteContentAction(id, password);
      if (result.success && result.content) {
        setContent(result.content);
        setIsLocked(false);
      } else {
        toast.error(result.error ?? "Invalid password");
      }
    });
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <Unlock className="mb-4 h-12 w-12 text-zinc-400" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Password Protected
        </h2>
        <p className="mb-6 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enter the password to view this paste.
        </p>
        <form onSubmit={handleUnlock} className="flex w-full max-w-xs gap-2 px-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Password"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? "..." : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  if (isEncrypted && content && !window.location.hash.startsWith("#key=")) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Encrypted Content
        </h2>
        <p className="mb-2 mt-1 max-w-xs px-4 text-sm text-zinc-500 dark:text-zinc-400">
          This paste is encrypted client-side. You need the decryption key (usually in the link) to view it.
        </p>
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
          Ciphertext hidden for security.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEncrypted && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Globe className="h-4 w-4" />
          <span>Client-side decrypted successfully</span>
        </div>
      )}
      <CodeBlock content={content ?? ""} language={language} />
    </div>
  );
}
