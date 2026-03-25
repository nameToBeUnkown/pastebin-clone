import { prisma } from "@/src/lib/prisma";
import type { CreateCommentInput, Comment } from "@/src/types/comment";

export async function createComment(data: CreateCommentInput, authorId: string): Promise<Comment> {
  const comment = (await prisma.comment.create({
    data: {
      content: data.content,
      paste: {
        connect: { id: data.pasteId },
      },
      author: {
        connect: { id: authorId },
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })) as unknown as Comment;

  return comment;
}

export async function getCommentsByPasteId(pasteId: string): Promise<Comment[]> {
  const comments = (await prisma.comment.findMany({
    where: { pasteId },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })) as unknown as Comment[];

  return comments;
}

export async function deleteComment(commentId: string, authorId: string): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== authorId) {
    throw new Error("Unauthorized to delete this comment");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });
}
