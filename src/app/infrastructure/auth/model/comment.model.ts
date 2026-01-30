export interface CommentDto {
  commentId: number;
  authorId: number;
  authorUsername: string;
  videoId: number;
  videoTitle: string;
  videoOwnerId: number;
  content: string;
  createdAt: string; // ISO string sa backend-a
  updatedAt: string; // ISO string sa backend-a
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

