export interface CommentAuthor {
  id: string;
  name: string;
  image?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  pasteId: string;
  authorId: string;
  author: CommentAuthor;
}

export interface CreateCommentInput {
  content: string;
  pasteId: string;
}
