import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CommentDto, Page } from '../model/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private apiUrl = '/api/comments';

  constructor(private http: HttpClient) {}

  // Dohvati komentare za video (paginacija)
  getComments(videoId: number, page: number = 0, size: number = 20): Observable<CommentDto[]> {
    return this.http.get<Page<CommentDto>>(`${this.apiUrl}/video/${videoId}?page=${page}&size=${size}`)
      .pipe(
        map(pageData => pageData.content)
      );
  }

  // Kreiraj komentar
  addComment(videoId: number, content: string): Observable<CommentDto> {
    return this.http.post<CommentDto>(`${this.apiUrl}/video/${videoId}`, { content });
  }

  // Izmeni komentar
  editComment(commentId: number, content: string): Observable<CommentDto> {
    return this.http.put<CommentDto>(`${this.apiUrl}/${commentId}`, { content });
  }

  // Obrisi komentar
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }
}