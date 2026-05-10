import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  username: string;
  content: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private rxStomp = new RxStomp();

  constructor(private http: HttpClient) {}

  connect() {
    if (this.rxStomp.active) return;
    this.rxStomp.configure({
      brokerURL: 'ws://localhost:8080/ws'
    });
    this.rxStomp.activate();
  }

  getMessages(videoId: number): Observable<ChatMessage> {
    return this.rxStomp
      .watch(`/topic/chat/${videoId}`)
      .pipe(map(m => JSON.parse(m.body) as ChatMessage));
  }

  sendMessage(videoId: number, username: string, content: string) {
    this.rxStomp.publish({
      destination: `/app/chat/${videoId}`,
      body: JSON.stringify({ username, content })
    });
  }

  getHistory(videoId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`http://localhost:8080/api/chat/${videoId}`);
  }

  disconnect() {
    this.rxStomp.deactivate();
  }
}
