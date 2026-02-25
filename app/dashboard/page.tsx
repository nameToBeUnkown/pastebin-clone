import type { Metadata } from "next";
import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getUserPastes } from "@/src/services/paste-service";
import { PasteCard } from "@/src/components/features/PasteCard";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const pastes = await getUserPastes(session.user.id as string);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Welcome, {session.user.name}! You have {pastes.length} paste
            {pastes.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Link
          href="/new"
          className="flex w-fit items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4" />
          New Paste
        </Link>
      </div>

      {pastes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            You haven&apos;t created any pastes yet.
          </p>
          <Link
            href="/new"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Create Your First Paste
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pastes.map((paste) => (
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
      )}
    </div>
  );
}
