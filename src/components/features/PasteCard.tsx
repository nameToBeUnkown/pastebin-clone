import Link from "next/link";
import { Clock, Eye, User, Code, MessageSquare } from "lucide-react";

interface PasteCardProps {
  paste: {
    id: string;
    title: string;
    language: string;
    createdAt: Date;
    views: number;
    author?: { name: string } | null;
    _count?: {
        comments: number;
    }
  };
}

export function PasteCard({ paste }: PasteCardProps) {
  return (
    <Link
      href={`/paste/${paste.id}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-700"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="truncate text-base font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {paste.title}
        </h3>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Code className="h-3 w-3" />
          {paste.language}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatTimeAgo(new Date(paste.createdAt))}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          <span>{paste.views.toLocaleString()}</span>
        </div>
        {paste._count && (
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{paste._count.comments}</span>
          </div>
        )}
        {paste.author && (
          <div className="flex items-center gap-1.5 ml-auto">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium">{paste.author.name}</span>
          </div>
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

  if (seconds < 10) return "just now";
  if (seconds < MINUTE) return `${seconds}s ago`;
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`;
  return `${Math.floor(seconds / DAY)}d ago`;
}
