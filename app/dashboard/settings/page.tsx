import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { getUserProfile } from "@/src/services/user-service";
import { ProfileSettingsForm } from "@/src/components/features/ProfileSettingsForm";

export const metadata = {
  title: "Profile Settings",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.id);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Profile Settings
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <ProfileSettingsForm user={profile} />
      </div>
    </div>
  );
}
