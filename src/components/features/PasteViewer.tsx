"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { Unlock, AlertTriangle, Key, Download, ExternalLink } from "lucide-react";
import { CodeBlock } from "@/src/components/features/CodeBlock";
import { getPasteContentAction } from "@/src/actions/paste-actions";
import { ChangePasswordDialog } from "@/src/components/features/ChangePasswordDialog";
import { base64ToBuffer } from "@/src/lib/utils";

interface PasteViewerProps {
  id: string;
  title: string;
  language: string;
  isEncrypted: boolean;
  hasPassword: boolean;
  isOwner?: boolean;
  initialContent?: string | null;
}

export function PasteViewer({
  id,
  title,
  language,
  isEncrypted,
  hasPassword,
  isOwner,
  initialContent,
}: PasteViewerProps) {
  const [content, setContent] = useState<string | null>(initialContent ?? null);
  const [isLocked, setIsLocked] = useState(hasPassword && !initialContent);
  const [password, setPassword] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  async function decryptContent(
    encryptedContent: string,
    keyBase64: string,
  ): Promise<string> {
    const [ivBase64, encryptedBase64] = encryptedContent.split(":");
    if (!ivBase64 || !encryptedBase64) throw new Error("Invalid format");

    const keyData = base64ToBuffer(keyBase64);
    const iv = base64ToBuffer(ivBase64);
    const encryptedData = base64ToBuffer(encryptedBase64);

    const key = await window.crypto.subtle.importKey(
      "raw",
      keyData.buffer as ArrayBuffer,
      "AES-GCM",
      false,
      ["decrypt"],
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      encryptedData.buffer as ArrayBuffer,
    );

    return new TextDecoder().decode(decrypted);
  }

  const performDecryption = useCallback(
    async (keyBase64: string, showToast = false) => {
      if (!content) return false;
      try {
        const decoded = await decryptContent(content, keyBase64);
        setContent(decoded);
        setIsDecrypted(true);
        if (showToast) toast.success("Decrypted successfully!");
        return true;
      } catch (err) {
        console.error(err);
        if (showToast) toast.error("Invalid decryption key");
        return false;
      }
    },
    [content]
  );

  // Auto-decrypt if key in URL
  useEffect(() => {
    if (isMounted && content && isEncrypted && !isDecrypted) {
      const hash = window.location.hash;
      if (hash.startsWith("#key=")) {
        const keyBase64 = hash.replace("#key=", "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        performDecryption(keyBase64);
      }
    }
  }, [isMounted, content, isEncrypted, isDecrypted, performDecryption]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await getPasteContentAction(id, password);
      if (result.success && result.content) {
        setContent(result.content);
        setIsLocked(false);

        if (isEncrypted) {
          const hash = window.location.hash;
          if (hash.startsWith("#key=")) {
            const keyBase64 = hash.replace("#key=", "");
            try {
              const decrypted = await decryptContent(result.content, keyBase64);
              setContent(decrypted);
              setIsDecrypted(true);
            } catch {
              // Auto-decrypt failed; user can use manual decrypt input
            }
          }
        }
      } else {
        toast.error(result.error ?? "Invalid password");
      }
    });
  }

  const handleManualDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualKey) return;
    performDecryption(manualKey, true);
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_") || "paste"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isMounted)
    return (
      <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    );

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <Unlock className="mb-4 h-12 w-12 text-zinc-400" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Server-Side Password Protected
        </h2>
        <p className="mb-6 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enter the password to view this paste.
        </p>
        <form
          onSubmit={handleUnlock}
          className="flex w-full max-w-xs gap-2 px-4"
        >
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

  if (isEncrypted && !isDecrypted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Client-Side Encrypted
        </h2>
        <p className="mb-6 mt-1 max-w-xs px-4 text-sm text-zinc-500 dark:text-zinc-400">
          This paste is encrypted client-side. You need the decryption key to
          view it.
        </p>

        <form
          onSubmit={handleManualDecrypt}
          className="flex w-full max-w-md flex-col gap-3 px-6"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Paste decryption key here..."
              required
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Key className="h-4 w-4" />
              Decrypt
            </button>
          </div>
        </form>

        {isOwner && (
          <div className="mt-8">
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Key className="h-4 w-4" />
              Manage Password & Encryption
            </button>
          </div>
        )}

        {showPasswordDialog && (
          <ChangePasswordDialog
            pasteId={id}
            onClose={() => setShowPasswordDialog(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          {!isEncrypted && !hasPassword && (
            <a
              href={`/api/raw/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ExternalLink className="h-4 w-4" />
              Raw
            </a>
          )}
        </div>
      </div>

      <CodeBlock content={content ?? ""} language={language} />

      {isOwner && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Key className="h-4 w-4" />
            Manage Password
          </button>
        </div>
      )}

      {showPasswordDialog && (
        <ChangePasswordDialog
          pasteId={id}
          onClose={() => setShowPasswordDialog(false)}
        />
      )}
    </div>
  );
}
