"use client";

import Image from "next/image";
import { useTransition, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/src/actions/user-actions";

type ProfileSettingsFormProps = {
  user: {
    name: string;
    bio?: string | null;
    image?: string | null;
  };
};

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setErrors({});
    startTransition(async () => {
      const result = await updateProfileAction(formData);

      if (result.success) {
        toast.success("Profile updated successfully!");
      } else {
        setErrors({ form: result.error ?? "Update failed" });
        toast.error(result.error ?? "Update failed");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:flex-row">
      <div className="flex-1 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={user.name}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={user.bio || ""}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Tell us about yourself"
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Profile Image
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
          />
        </div>

        {errors.form && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col items-center justify-start space-y-4 pt-6 md:w-64">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Live Preview
        </h3>
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-600 shadow-sm dark:bg-indigo-950/50">
          {user.image ? (
            <Image
              src={user.image}
              alt="Profile preview"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl">{user.name[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="text-center">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {user.name}
          </p>
          {user.bio ? (
            <p className="mt-1 text-sm text-zinc-500">{user.bio}</p>
          ) : (
            <p className="mt-1 text-sm italic text-zinc-400">No bio provided</p>
          )}
        </div>
      </div>
    </form>
  );
}
