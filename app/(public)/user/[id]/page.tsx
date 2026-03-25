import {
  getUserProfile,
  getUserStats,
  getPastesByAuthorId,
} from "@/src/services/user-service";
import { notFound } from "next/navigation";
import { PasteCard } from "@/src/components/features/PasteCard";
import { Eye, FileText, MessageSquare, Calendar } from "lucide-react";
import { auth } from "@/src/lib/auth";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const profile = await getUserProfile(id);
    const stats = await getUserStats(id);
    const session = await auth();
    const isOwner = session?.user?.id === id;
    const pastes = await getPastesByAuthorId(id, isOwner);

    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-12 flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-8">
          <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4 sm:mb-0 overflow-hidden">
            {profile.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.image}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              profile.name[0].toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {profile.name}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400 max-w-2xl">
              {profile.bio || "No bio available."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Joined{" "}
                {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 mb-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Pastes</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {profile._count.pastes}
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 mb-2">
              <Eye className="h-5 w-5" />
              <span className="text-sm font-medium">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.totalViews}
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 mb-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">Comments</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {profile._count.comments}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          Pastes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pastes.length === 0 ? (
            <p className="col-span-full text-center py-12 text-zinc-500 italic">
              No public pastes yet.
            </p>
          ) : (
            pastes.map((paste) => (
              <PasteCard key={paste.id} paste={paste} />
            ))
          )}
        </div>
      </div>
    );
  } catch (error) {
    void error;
    notFound();
  }
}
