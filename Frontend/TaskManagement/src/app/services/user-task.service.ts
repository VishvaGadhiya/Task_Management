import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface UserTask {
  id?: number;
  userId: number;
  taskId: number;
  
}

export interface UserTaskDataTableRequest {
  Draw: number;
  Start: number;
  Length: number;
  SearchValue?: string;
  SortColumn?: string;
  SortDirection?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserTaskService {
  private apiUrl = 'https://localhost:7125/api/UserTasks';

  constructor(private http: HttpClient) {}

  getUserTasks(page: number, pageSize: number, searchTerm: string = '', sortColumn: string = '', sortDirection: string = ''): Observable<any> {
    const request: UserTaskDataTableRequest = {
      Draw: 1,
      Start: (page - 1) * pageSize,
      Length: pageSize,
      SearchValue: searchTerm,
      SortColumn: sortColumn,
      SortDirection: sortDirection
    };
    return this.http.post<any>(`${this.apiUrl}/GetPaginated`, request);
  }

  addUserTask(userTask: UserTask): Observable<any> {
    return this.http.post(this.apiUrl, userTask);
  }

  updateUserTask(userTask: UserTask): Observable<any> {
    if (!userTask.id) throw new Error("User Task id is required to update.");
    return this.http.put(`${this.apiUrl}/${userTask.id}`, userTask);
  }

  deleteUserTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks`);
  }
}
