"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Save, Lock } from "lucide-react";
import { updatePasteAction } from "@/src/actions/paste-actions";

interface ChangePasswordDialogProps {
  pasteId: string;
  isEncrypted: boolean;
  decryptedContent?: string;
  onClose: () => void;
}

export function ChangePasswordDialog({
  pasteId,
  isEncrypted,
  decryptedContent,
  onClose,
}: ChangePasswordDialogProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        let newContent: string | undefined = undefined;
        let encryptionKey = "";

        if (isEncrypted && decryptedContent) {
          // PROD READY: Re-encrypt content with NEW key
          const key = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"],
          );

          const iv = window.crypto.getRandomValues(new Uint8Array(12));
          const encodedContent = new TextEncoder().encode(decryptedContent);
          const encryptedContent = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encodedContent,
          );

          const exportedKey = await window.crypto.subtle.exportKey("raw", key);
          const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
          const ivBase64 = btoa(String.fromCharCode(...iv));
          const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));

          newContent = `${ivBase64}:${encryptedBase64}`;
          encryptionKey = keyBase64;
        }

        const result = await updatePasteAction(pasteId, {
          newPassword: password || undefined,
          newContent,
        });

        if (result.success) {
          toast.success(password ? "Password updated" : "Password removed");
          if (encryptionKey) {
            // Update the URL hash with the NEW encryption key
            window.location.hash = `#key=${encryptionKey}`;
            toast.info("Encryption key updated. Link is now different!");
          }
          router.refresh();
          onClose();
        } else {
          toast.error(result.error ?? "Failed to update");
        }
      } catch (err) {
        console.error(err);
        toast.error("Process failed");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Manage Paste Settings
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Leave empty to remove access password"
              autoFocus
            />
          </div>

          {isEncrypted && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <p className="font-bold mb-1">Note:</p>
              Since this paste is encrypted, saving changes will generate a **NEW** encryption key and update your URL link.
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : "Apply Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
