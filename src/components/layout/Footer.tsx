export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500 dark:text-zinc-400 sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} PasteBin Clone. Built with Next.js,
          Prisma & TypeScript.
        </p>
      </div>
    </footer>
  );
}
