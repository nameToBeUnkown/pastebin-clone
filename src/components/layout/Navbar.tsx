import Link from "next/link";
import { auth, signOut } from "@/src/lib/auth";
import { Code, LogIn, LogOut, LayoutDashboard, PlusCircle } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-zinc-900 transition-colors hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
        >
          <Code className="h-6 w-6" />
          <span>PasteBin</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/new"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 sm:px-4"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Paste</span>
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
