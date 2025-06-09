import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ProfileComponent } from '../profile/profile.component';
import { UserProfile } from '../models/Dtos/profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7125/api/User';
  private accountApiUrl = 'https://localhost:7125/api/Account';

  constructor(private http: HttpClient) { }

  getUsers(page: number, pageSize: number, searchTerm: string = '', gender: string = '', status: string = '', sortColumn: string = '', sortDirection: string = ''): Observable<any> {
    const request = {
      Draw: 1,
      Start: (page - 1) * pageSize,
      Length: pageSize,
      SearchValue: searchTerm,
      Gender: gender,
      Status: status,
      SortColumn: sortColumn,
      SortDirection: sortDirection
    };

return this.http.post<any>(`${this.apiUrl}/GetPaginated`, request);

  }

updateUser(id: number, user: any): Observable<{success: boolean, message?: string}> {
  return this.http.post<{success: boolean, message?: string}>(
    `${this.apiUrl}/EditStatus`,
    user,
    { withCredentials: true }
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400) {
        return throwError(() => error.error);
      }
      return throwError(() => new Error('Something went wrong. Please try again later.'));
    })
  );
}


  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`, { withCredentials: true });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('UserService error:', error);
    if (error.status === 401) {
      return throwError(() => new Error('Your session has expired. Please log in again.'));
    }
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.accountApiUrl}/my-profile`);
  }

updateProfile(formData: FormData) {
  return this.http.put(`${this.accountApiUrl}/update-profile`, formData, { withCredentials: true });
}
getUserStatistics(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/statistics`);
}

  changePassword(data: any): Observable<void> {
    return this.http.post<void>(`${this.accountApiUrl}/change-password`, data);
  }
}
