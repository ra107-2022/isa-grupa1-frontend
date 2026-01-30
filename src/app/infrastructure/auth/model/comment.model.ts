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
