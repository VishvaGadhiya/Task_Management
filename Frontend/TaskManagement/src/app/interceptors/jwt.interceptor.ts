import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');
    console.log("Inter " + token);
    //const headersConfig = token ? { Authorization: `Bearer ${token}` } : {};

    const newRequest = request.clone({
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });




    return next.handle(newRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('JWT Error - Token may be invalid or expired');

          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.log('Token expiry:', new Date(payload.exp * 1000));
            } catch (e) {
              console.error('Token decode error:', e);
            }
          }
        }
        return throwError(() => error);
      })
    );
  }
}