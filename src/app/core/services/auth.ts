import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, throwError, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token = new BehaviorSubject<string | null>(null);
  constructor(private http: HttpClient, private router: Router) { }
  
  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${environment.apiUrl}/v1/authenticate`,
      { username, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }
  
  setToken(token: string): void {
    this.token.next(token); // Actualiza el valor del token.
  }
  
  getToken(): string | null {
    return this.token.value;
  }
  
  isLoggedIn(): Observable<boolean> {
    return this.token.asObservable().pipe(map((token: string | null) => !!token));
  }
  
  logout(): void {
    this.token.next(null); // Limpia el token almacenado.
    this.router.navigate(['/']); // Redirige al usuario a la ruta raíz.
  }
}