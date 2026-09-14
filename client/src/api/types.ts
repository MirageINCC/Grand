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
}

export interface SessionUser {
  id: string;
  username: string;
  avatar: string | null;
  isAdmin: boolean;
}
