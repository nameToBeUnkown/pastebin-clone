"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { deleteCommentAction } from "@/src/actions/comment-actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { Comment } from "@/src/types/comment";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string | null;
}

export function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserId === comment.authorId;

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteCommentAction(comment.id, comment.pasteId);
      if (result.success) {
        toast.success("Comment deleted");
      } else {
        toast.error(result.error ?? "Failed to delete comment");
      }
    });
  }

  return (
    <div className="group rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href={`/user/${comment.authorId}`} className="shrink-0">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-600 transition-transform hover:scale-105 dark:bg-indigo-950/50">
              {comment.author.image ? (
                <Image
                  src={comment.author.image}
                  alt={comment.author.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs">
                  {comment.author.name[0].toUpperCase()}
                </span>
              )}
            </div>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${comment.authorId}`}
                className="text-sm font-semibold text-zinc-900 transition-colors hover:text-indigo-600 hover:underline dark:text-zinc-100 dark:hover:text-indigo-400"
              >
                {comment.author.name}
              </Link>
              <span className="text-xs text-zinc-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
              {comment.content}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="opacity-0 transition-opacity group-hover:opacity-100 text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
