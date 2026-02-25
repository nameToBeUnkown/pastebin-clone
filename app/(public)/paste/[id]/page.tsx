import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPasteById,
  incrementPasteViews,
} from "@/src/services/paste-service";
import { auth } from "@/src/lib/auth";
import { CodeBlock } from "@/src/components/features/CodeBlock";
import { PasteActions } from "@/src/components/features/PasteActions";
import { Clock, Eye, User, Globe, Lock } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const paste = await getPasteById(id);

  if (!paste) {
    return { title: "Paste Not Found" };
  }

  return {
    title: paste.title,
    description: `${paste.language} paste by ${paste.author?.name ?? "Anonymous"}`,
  };
}

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paste = await getPasteById(id);

  if (!paste) {
    notFound();
  }

  await incrementPasteViews(id);

  const session = await auth();
  const isOwner = session?.user?.id === paste.authorId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {paste.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {paste.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {paste.views + 1} views
            </span>
            {paste.author && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {paste.author.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              {paste.isPublic ? (
                <>
                  <Globe className="h-4 w-4" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Private
                </>
              )}
            </span>
            {paste.expiresAt && (
              <span className="text-amber-600 dark:text-amber-400">
                Expires:{" "}
                {paste.expiresAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {isOwner && (
          <PasteActions pasteId={paste.id} isPublic={paste.isPublic} />
        )}
      </div>

      <CodeBlock content={paste.content} language={paste.language} />
    </div>
  );
}
