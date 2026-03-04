import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  fetchStudents(): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }

    return this.http.get(`${environment.apiUrl}/students`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }
}
