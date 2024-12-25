export interface NewsStatistics {
  total: number;
  published: number;
  draft: number;
  recentlyUpdated: number;
  archived: number;
}

export interface News {
  id: number;
  title: string;
  state: "draft" | "published" | "archived";
  createdAt: string;
  publishedAt: any;
  updatedAt: string;
  content?: string;
}
