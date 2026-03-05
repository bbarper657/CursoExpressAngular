import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, throwError, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token = new BehaviorSubject<string | null>(null);
  constructor(private http: HttpClient, private router: Router, private notificationService: NotificationService) { }
  
  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${environment.apiUrl}/v1/authenticate`,
      { username, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        console.log('Login exitoso, conectando a WebSockets...');
        this.notificationService.connect();
      })
    )
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

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.sub || null;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
  
  logout(): void {
    console.log('Cerrando sesión y desconectando de WebSockets...');
    this.token.next(null); // Limpia el token almacenado.
    this.notificationService.disconnect();
    this.router.navigate(['/']); // Redirige al usuario a la ruta raíz.
  }
}