import { Injectable } from "@angular/core";
import { ACCESS_TOKEN, USER } from "src/constants";

@Injectable({
  providedIn: 'root'
})
export class TokenStorage {
  constructor() { }

  public saveToken(token: string): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.setItem(ACCESS_TOKEN, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USER);
  }
}