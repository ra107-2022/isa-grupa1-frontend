import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivityType } from "./model/activity-type.enum";
import { Observable } from "rxjs";
import { environment } from "src/env/environment";

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
    constructor(private http: HttpClient) { }

    logActivity(videoId: number | undefined, activityType: ActivityType, lon: number, lat: number): void {
            const params = {
            type: activityType.toString(),
            lon: lon.toString(),
            lat: lat.toString()
        };

        this.http.post(environment.apiHost + `videos/${videoId}/log`, null, { params: params }).subscribe();
    }

    getTrendingVideos(lon: number, lat: number, radius: number, limit: number): Observable<number[]> {
        return this.http.get<number[]>(environment.apiHost + `videos/trending/local?lon=${lon}&lat=${lat}&radius=${radius}&limit=${limit}`);
    }
}