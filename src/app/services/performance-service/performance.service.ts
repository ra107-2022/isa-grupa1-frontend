import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PerformanceStats {
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  totalRequests: number;
}
export interface PerformanceDataPoint {
  timestamp: string;
  avgResponseTimeMs: number;
  requestCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private apiUrl: string = "http://localhost:8080/api/videos";

  constructor(
    private http: HttpClient
  ) { }

  loadRealTimeGraph(): Observable<PerformanceStats> {
    return this.http.get<PerformanceStats>(`${this.apiUrl}/performance/realtime`);
  }
  loadPerformanceGraph(): Observable<PerformanceDataPoint[]> {
    return this.http.get<PerformanceDataPoint[]>(`${this.apiUrl}/performance/graph`);
  }
}
