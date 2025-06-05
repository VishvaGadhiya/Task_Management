import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class RegisterService {
  private baseUrl = 'https://localhost:7125/api/Account/register'; // Updated to point to the Register endpoint

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }
}
