import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
 
@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private apiUrl = 'https://localhost:7125/api/Manager'; // API endpoint for managers
 
  constructor(private http: HttpClient) {}
 
getManagers(
  page: number,
  pageSize: number,
  searchTerm: string = '',
  gender: string = '',
  status: string = '',
  sortColumn: string = '',
  sortDirection: string = ''
): Observable<any> {
  const request = {
    Draw: 1,
    Start: (page - 1) * pageSize,
    Length: pageSize,
    SearchValue: searchTerm, // This will search across all searchable fields
    Gender: gender,
    Status: status,
    SortColumn: sortColumn,
    SortDirection: sortDirection
  };
 
  return this.http.post<any>(`${this.apiUrl}/GetPaginated`, request).pipe(
    catchError(this.handleError)
  );
}
 
addManager(manager: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}`, manager).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('ManagerService Error:', error);
      return throwError(() => error);
    })
  );
}
 
  updateManager(manager: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${manager.id}`, manager).pipe(
      catchError(this.handleError)
    );
  }
 
  deleteManager(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
 
  private handleError(error: HttpErrorResponse) {
    console.error('ManagerService Error:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
 