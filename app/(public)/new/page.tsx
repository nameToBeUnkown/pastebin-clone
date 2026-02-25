import type { Metadata } from "next";
import { CreatePasteForm } from "@/src/components/features/CreatePasteForm";

export const metadata: Metadata = {
  title: "New Paste",
};

export default function NewPastePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Create New Paste
      </h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CreatePasteForm />
      </div>
    </div>
  );
}
