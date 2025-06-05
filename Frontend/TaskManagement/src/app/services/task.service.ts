import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'https://localhost:7125/api/Tasks';

  constructor(private http: HttpClient) { }

  getTasksPaginated(
    page: number, 
    pageSize: number, 
    searchTerm: string = '', 
    status: string = '', 
    sortColumn: string = '', 
    sortDirection: string = ''
  ): Observable<any> {
    const request = {
      Draw: 1,
      Start: (page - 1) * pageSize,
      Length: pageSize,
      SearchValue: searchTerm,
      Status: status,
      SortColumn: sortColumn,
      SortDirection: sortDirection
    };

    return this.http.post<any>(`${this.apiUrl}/GetPaginated`, request, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  addTask(task: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, task, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  updateTask(task: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${task.id}`, task, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('TaskService error:', error);
    if (error.status === 401) {
      return throwError(() => new Error('Your session has expired. Please log in again.'));
    }
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }
}
