export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Marker {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  categoryId: string;
  category: Category;
  createdBy: string;
  createdByName: string;
  /** Anchor for the 24h "Unternehmen" collect timer — see BusinessPanel.tsx. ISO date string. */
  lastCollectedAt: string;
}

export interface SessionUser {
  id: string;
  username: string;
  avatar: string | null;
  isAdmin: boolean;
}
