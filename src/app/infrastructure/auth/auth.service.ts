import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { User } from "./model/user.model";
import { TokenStorage } from "./jwt/token.storage";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Login } from "./model/login.model";
import { AuthResponse } from "./model/auth-response";
import { environment } from "src/env/environment";
import { JwtHelperService } from '@auth0/angular-jwt';
import { Registration } from "./model/register.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    user$ = new BehaviorSubject<User>({id: 0, email: ''});

    get currentUser(): User {
        return this.user$.value;
    }

    constructor(private http: HttpClient,
                private tokenStorage: TokenStorage,
                private router: Router) { }

    login(login: Login): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(environment.apiHost + 'auth/login', login)
            .pipe(
                tap(response => {
                    this.tokenStorage.saveToken(response.token);
                    this.setUser();
        }));
    }

    register(registration: Registration): Observable<string> {
        return this.http.post(environment.apiHost + 'auth/signup', 
                registration,
                { responseType: 'text' }
            );
    }

    logout(): void {
        this.router.navigate(['/home']).then(_ => {
                this.tokenStorage.clear();
                this.user$.next({email: "", id: 0});
            }
        );
    }

    private setUser(): void {
        const jwtHelperService = new JwtHelperService();
        const accessToken = this.tokenStorage.getToken() || "";
        const decodedToken = jwtHelperService.decodeToken(accessToken);
        console.log('Decoded token:', decodedToken);
        const user: User = {
            id: +decodedToken.key,
            email: decodedToken.sub,
        };

        this.user$.next(user);
    }

    checkIfUserExists(): void {
        const accessToken = this.tokenStorage.getToken();
        if (accessToken == null) {
            return;
        }
        this.setUser();
    }

    isLoggedIn(): boolean {
        const token = this.tokenStorage.getToken();
        if(!token) { return false; }
        const jwtHelperService = new JwtHelperService();
        return !jwtHelperService.isTokenExpired(token);
    }

    verifyEmail(token: string): Observable<string> {
        return this.http.get<string>(`${environment.apiHost}auth/verify?token=${token}`, 
            { responseType: 'text' as 'json' });
    }

    resendVerificationEmail(email: string): Observable<string> {
        return this.http.post(`${environment.apiHost}auth/resend-verification?email=${email}`, 
            null,
            { responseType: 'text' }
        );
    }
}