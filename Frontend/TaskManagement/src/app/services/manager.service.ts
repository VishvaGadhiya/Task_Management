import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
 
@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private apiUrl = `${environment.apiUrl}/Manager`;  
 
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
    SearchValue: searchTerm, 
    Gender: gender,
    Status: status,
    SortColumn: sortColumn,
    SortDirection: sortDirection
  };
 
  return this.http.post<any>(`${this.apiUrl}/GetPaginated`, request).pipe(
    catchError(this.handleError)
  );
}
 
addManager(formData: FormData): Observable<any> {
  return this.http.post<any>(this.apiUrl, formData).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('ManagerService Error:', error);
      return throwError(() => error);
    })
  );
}

updateManager(id: number, formData: FormData): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, formData).pipe(
    catchError(this.handleError)
  );
}
 
  deleteManager(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
 getManagerStatistics(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/statistics`);
}

  private handleError(error: HttpErrorResponse) {
    console.error('ManagerService Error:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
 