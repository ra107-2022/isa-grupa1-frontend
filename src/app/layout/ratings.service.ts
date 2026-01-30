import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/env/environment";
import { RatingsCount } from "./model/ratings-count.model";
import { UserRating } from "./model/user-rating.model";

@Injectable({
  providedIn: 'root'
})
export class RatingsService {
    constructor(private http: HttpClient) { }

    getRatingsCount(videoId: number | undefined): Observable<RatingsCount> {
      return this.http.get<RatingsCount>(environment.apiHost + `ratings/${videoId}/couts`);
    }

    getUserRating(videoId: number | undefined): Observable<UserRating> {
      return this.http.get<UserRating>(environment.apiHost + `ratings/${videoId}/my`);
    }

    likeVideo(videoId: number | undefined): Observable<UserRating> {
      return this.http.post<UserRating>(environment.apiHost + `ratings/${videoId}/like`, {});
    }

    dislikeVideo(videoId: number | undefined): Observable<UserRating> {
      return this.http.post<UserRating>(environment.apiHost + `ratings/${videoId}/dislike`, {});
    }
}