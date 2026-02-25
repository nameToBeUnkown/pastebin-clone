import type { Metadata } from "next";
import { PasteCard } from "@/src/components/features/PasteCard";
import { SearchBar } from "@/src/components/features/SearchBar";
import {
  getRecentPublicPastes,
  searchPastes,
} from "@/src/services/paste-service";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Recent Pastes",
};

interface HomePageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const result = query
    ? await searchPastes(query, page)
    : await getRecentPublicPastes(page);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {query ? `Search: "${query}"` : "Recent Pastes"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {result.total} paste{result.total !== 1 ? "s" : ""} found
          </p>
        </div>
        <SearchBar />
      </div>

      {result.pastes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            {query
              ? "No pastes match your search."
              : "No pastes yet. Be the first to create one!"}
          </p>
          <Link
            href="/new"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Create a Paste
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.pastes.map((paste) => (
              <PasteCard
                key={paste.id}
                id={paste.id}
                title={paste.title}
                language={paste.language}
                createdAt={paste.createdAt}
                views={paste.views}
                author={paste.author}
              />
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/?${query ? `q=${encodeURIComponent(query)}&` : ""}page=${page - 1}`}
                  className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              )}
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Page {result.currentPage} of {result.totalPages}
              </span>
              {page < result.totalPages && (
                <Link
                  href={`/?${query ? `q=${encodeURIComponent(query)}&` : ""}page=${page + 1}`}
                  className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
