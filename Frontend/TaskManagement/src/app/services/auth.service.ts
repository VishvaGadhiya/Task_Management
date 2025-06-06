import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';



@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://localhost:7125/api/Account';
  private tokenKey = 'authToken';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, {
      userName: username,
      password
    }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);

          localStorage.removeItem('token');

          this.loggedIn.next(true);
        }
      })
    );
  }
getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      return payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }



  logout() {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
  forgotPassword(email: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/forgot-password`,
      { email },
      { responseType: 'text' } 
    );
  }

  resetPassword(data: {
    userId: string,
    email: string,
    token: string,
    password: string,
    confirmPassword: string
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

getUserRole(): string | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    return (
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['role'] ||
      null
    );
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
}


  decodeAndLogToken() {
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expiration:', new Date(payload.exp * 1000));
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }
}
