import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { ACCESS_TOKEN } from "src/constants";

export interface WatchPartyRoom {
  code: string;
}

export type WatchPartyEvent =
  | {
      type: 'PLAY' | 'PAUSE' | 'SEEK';
      roomCode: string;
      videoId: number;
      timestamp?: number;
      clientTime: number;
    }
  | {
      type: 'USER_JOIN' | 'USER_LEAVE' | 'ROOM_CLOSED';
      roomCode: string;
      usersCount: number;
      clientTime: number;
    };

@Injectable({
  providedIn: 'root'
})
export class WatchpartyService {

  private apiUrl = 'http://localhost:8080/api/watch-party';
  private client!: Client;


  // u servisu ybog navigacije
  private _roomCode: string | null = null;
  private _isHost: boolean = false;
  private _usersCount: number = 1;

  get roomCode() { return this._roomCode; }
  get isHost() { return this._isHost; }
  get usersCount() { return this._usersCount; }

  setRoom(code: string, isHost: boolean) {
    this._roomCode = code;
    this._isHost = isHost;
  }

  clearRoom() {
    this._roomCode = null;
    this._isHost = false;
    this._usersCount = 1;
  }

  setUsersCount(count: number) {
    this._usersCount = count;
  }

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(ACCESS_TOKEN);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // REST API calls
  createRoom() {
    console.log(localStorage.getItem(ACCESS_TOKEN));
    return this.http.post(
      `${this.apiUrl}/rooms`,
      {},
      { headers: this.getAuthHeaders() } // auth header za REST poziv
    );
  }

  getRoom(roomCode: string) {
    return this.http.get(
      `${this.apiUrl}/rooms/${roomCode}`,
      { headers: this.getAuthHeaders() }
    );
  }

  joinRoom(roomCode: string) {
    return this.http.post(
      `${this.apiUrl}/rooms/${roomCode}/join`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }


  // WebSocket connection
  connect(roomCode: string, onMessage: (message: WatchPartyEvent) => void) {
    const token = localStorage.getItem(ACCESS_TOKEN);

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    this.client.onConnect = () => {
      this.client.subscribe(`/topic/room/${roomCode}`, (message) => {
        onMessage(JSON.parse(message.body));
      });
    };

    this.client.activate();
  }


  leaveRoom(roomCode: string) {
    return this.http.post(
      `${this.apiUrl}/rooms/${roomCode}/leave`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  closeRoom(roomCode: string) {
    return this.http.delete(
      `${this.apiUrl}/rooms/${roomCode}`,
      { headers: this.getAuthHeaders() }
    );
  }

  sendPlay(event: WatchPartyEvent) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket is not connected. Cannot send play event.');
      return;
    }

    this.client.publish({
      destination: `/app/watchparty/play`,
      body: JSON.stringify(event),
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
  
}