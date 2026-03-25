"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Unlock, Globe, AlertTriangle, Key } from "lucide-react";
import { CodeBlock } from "@/src/components/features/CodeBlock";
import { getPasteContentAction } from "@/src/actions/paste-actions";
import { ChangePasswordDialog } from "@/src/components/features/ChangePasswordDialog";

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
    setIsMounted(true);
  }, []);

  async function performDecryption(keyBase64: string, showToast = false) {
    if (!content) return false;
    try {
      const [ivBase64, encryptedBase64] = content.split(":");
      if (!ivBase64 || !encryptedBase64) throw new Error("Invalid format");

      const keyData = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
      const encryptedData = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

      const key = await window.crypto.subtle.importKey(
        "raw", keyData, "AES-GCM", false, ["decrypt"]
      );

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv }, key, encryptedData
      );

      const decoded = new TextDecoder().decode(decrypted);
      setContent(decoded);
      setIsDecrypted(true);
      if (showToast) toast.success("Decrypted successfully!");
      return true;
    } catch (err) {
      console.error(err);
      if (showToast) toast.error("Invalid decryption key");
      return false;
    }
  }

  useEffect(() => {
    if (isMounted && content && isEncrypted && !isDecrypted) {
      const hash = window.location.hash;
      if (hash.startsWith("#key=")) {
        const keyBase64 = hash.replace("#key=", "");
        performDecryption(keyBase64);
      }
    }
  }, [isMounted, content, isEncrypted, isDecrypted]);

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

  const handleManualDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualKey) return;
    performDecryption(manualKey, true);
  };

  if (!isMounted) return <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />;

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

  if (isEncrypted && !isDecrypted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Encrypted Content
        </h2>
        <p className="mb-6 mt-1 max-w-xs px-4 text-sm text-zinc-500 dark:text-zinc-400">
          This paste is encrypted client-side. You need the decryption key to view it.
        </p>
        
        <form onSubmit={handleManualDecrypt} className="flex w-full max-w-md flex-col gap-3 px-6">
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
            isEncrypted={isEncrypted}
            decryptedContent={content ?? undefined}
            onClose={() => setShowPasswordDialog(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEncrypted && isDecrypted && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Globe className="h-4 w-4" />
          <span>Client-side decrypted successfully</span>
        </div>
      )}
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
          isEncrypted={isEncrypted}
          decryptedContent={content ?? undefined}
          onClose={() => setShowPasswordDialog(false)}
        />
      )}
    </div>
  );
}
