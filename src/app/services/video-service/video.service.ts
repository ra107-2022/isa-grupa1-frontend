import { Injectable } from '@angular/core';

import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UploadProgress {
  progress: number;
  response?: any;
}

export type AllVideoInfo = {
    ownerId: number;
    ownerUsername: string;

    title: string;
    description: string;
    tags: string[];
    publishDate: string;

    viewCount: number;
    likeCount: number;
    dislikeCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'http://localhost:8080/api/videos';

  constructor(private http: HttpClient) { }

  uploadVideo(
    videoFile: File,
    thumbnailFile: File,
    title: string,
    description: string,
    tags: string[],
    latitude?: number,
    longitude?: number
  ) {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('thumbnail', thumbnailFile);
    formData.append('title', title);
    formData.append('description', description);
    tags.forEach(tag => { formData.append('tags', tag); })
    if (latitude !== null && latitude !== undefined) {
      formData.append('latitude', latitude.toString());
    }
    if (longitude !== null && longitude !== undefined) {
      formData.append('longitude', longitude.toString());
    }

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
      withCredentials: true,
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          return { progress: Math.round(100 * event.loaded / (event.total || 1)) };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, response: event.body };
        }
        return { progress: 0 };
      })
    )
  }

  getAllVideoInfo(id: number): Observable<AllVideoInfo> {
    return this.http.get<AllVideoInfo>(`${this.apiUrl}/${id}/all_video_info`);
  }

  getVideoUrl(id: number): string {
    return `${this.apiUrl}/${id}/video`;
  }

  getThumbnailUrl(id: number): string {
    return `${this.apiUrl}/${id}/thumbnail`;
  }
}
