"use client";

import { useTransition, useRef } from "react";
import { createCommentAction } from "@/src/actions/comment-actions";
import { toast } from "sonner";

interface CommentFormProps {
  pasteId: string;
}

export function CommentForm({ pasteId }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    startTransition(async () => {
      const result = await createCommentAction(formData);
      if (result.success) {
        toast.success("Comment posted!");
        formRef.current?.reset();
      } else {
        toast.error(result.error ?? "Failed to post comment");
      }
    });
  }

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="pasteId" value={pasteId} />
      <textarea
        name="content"
        placeholder="Write a comment..."
        required
        disabled={isPending}
        className="w-full min-h-25 rounded-xl border border-zinc-200 bg-white p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
