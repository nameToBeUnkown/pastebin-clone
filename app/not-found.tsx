import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-zinc-300 dark:text-zinc-700">
        404
      </h1>
      <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Page Not Found
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        The paste you&apos;re looking for doesn&apos;t exist or has expired.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Go Home
      </Link>
    </div>
  );
}
