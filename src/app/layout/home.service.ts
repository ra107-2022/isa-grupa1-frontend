import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/env/environment";
import { VideoInfo } from "./model/video-info.model";

@Injectable({
  providedIn: 'root'
})
export class HomeService {
    constructor(private http: HttpClient) { }

    getThumbnail(videoId: number): Observable<Blob> {
      return this.http.get(environment.apiHost + `videos/${videoId}/thumbnail`, { responseType: 'blob' });
    }

    getVideoInfo(videoId: number): Observable<VideoInfo> {
      return this.http.get<VideoInfo>(environment.apiHost + `videos/${videoId}/video_info`);
    }

    getPagedVideos(page: number, size: number): Observable<number[]> {
      const params = { start: page, count: size };
      return this.http.get<number[]>(environment.apiHost + `videos/get_page`, { params });
    }
}