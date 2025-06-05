import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Task {
  id: number;
  taskId: number;
  title: string;
  description: string;
  dueDate: string;
  status: string;
}

interface TaskResponse {
  data: Task[];
  recordsTotal: number;
  recordsFiltered: number;
}

@Injectable({
  providedIn: 'root'
})
export class MyTasksService {
  private baseUrl = 'https://localhost:7125/api/MyTasks';

  constructor(private http: HttpClient) { }

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getTasks(
    page: number,
    pageSize: number,
    searchTerm: string = '',
    statusFilter: string = '',
    sortColumn: string = '',
    sortDirection: string = ''
  ): Observable<TaskResponse> {
    const headers = this.getHeaders();
    const request = {
      Draw: 1,
      Start: (page - 1) * pageSize,
      Length: pageSize,
      SearchValue: searchTerm,
      Status: statusFilter,
      SortColumn: sortColumn,
      SortDirection: sortDirection
    };

    return this.http.post<TaskResponse>(`${this.baseUrl}/paginated`, request, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  updateTaskStatus(taskId: number, newStatus: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.baseUrl}/update-status/${taskId}`, JSON.stringify(newStatus), {
      headers,
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('MyTasksService error:', error);
    if (error.status === 401) {
      return throwError(() => new Error('Your session has expired. Please log in again.'));
    }
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }
}