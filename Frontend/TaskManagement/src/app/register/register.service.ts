import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class RegisterService {
private baseUrl = `${environment.apiUrl}/Account/register`;

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }
}
