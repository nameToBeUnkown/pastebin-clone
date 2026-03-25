import { getCommentsByPasteId } from "@/src/services/comment-service";
import { auth } from "@/src/lib/auth";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  pasteId: string;
}

export async function CommentSection({ pasteId }: CommentSectionProps) {
  const session = await auth();
  const comments = await getCommentsByPasteId(pasteId);

  return (
    <div className="space-y-8 mt-12 py-8 border-t border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Comments ({comments.length})
        </h3>
      </div>
      
      {session?.user ? (
        <CommentForm pasteId={pasteId} />
      ) : (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-sm font-medium text-center">
          Sign in to leave a comment.
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm italic">
            No comments yet. Be the first to start the conversation!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              currentUserId={session?.user?.id} 
            />
          ))
        )}
      </div>
    </div>
  );
}
