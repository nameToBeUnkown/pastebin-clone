import Link from "next/link";
import { Clock, Eye, User, Code } from "lucide-react";

interface PasteCardProps {
  id: string;
  title: string;
  language: string;
  createdAt: Date;
  views: number;
  author?: { name: string } | null;
}

export function PasteCard({
  id,
  title,
  language,
  createdAt,
  views,
  author,
}: PasteCardProps) {
  return (
    <Link
      href={`/paste/${id}`}
      className="group block rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-700"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="truncate text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {title}
        </h3>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          <Code className="h-3 w-3" />
          {language}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTimeAgo(createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {views}
        </span>
        {author && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {author.name}
          </span>
        )}
      </div>
    </Link>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const MINUTE = 60;
  const HOUR = 3600;
  const DAY = 86400;

  if (seconds < MINUTE) return "just now";
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`;
  return `${Math.floor(seconds / DAY)}d ago`;
}
