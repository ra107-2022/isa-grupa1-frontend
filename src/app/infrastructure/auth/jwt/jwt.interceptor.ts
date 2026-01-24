import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ACCESS_TOKEN } from "src/constants";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem(ACCESS_TOKEN);

        if (token) {
            const accessTokenRequest = request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
            });
            return next.handle(accessTokenRequest);
        }

        console.log('JWT Interceptor - No token found for request:', request.url);
        return next.handle(request);
    }
}