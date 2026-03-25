export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  createdAt: Date;
  _count: {
    pastes: number;
    comments: number;
  };
}

export interface UserStats {
  totalViews: number;
}
