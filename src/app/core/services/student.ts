import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  fetchStudents(page: number, size: number, sortColumn: string, sortDirection: string): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }

    // Construcción de los parámetros de la solicitud HTTP
    const params = new HttpParams()
      .set('page', page.toString()) // Página solicitada
      .set('size', size.toString()) // Cantidad de elementos por página
      .set('sort', `${sortColumn},${sortDirection}`); // Parámetro de ordenación en formato "columna,dircción"

    // Realizar la solicitud GET a la API con autenticación y parámetros de paginación y ordenación
    return this.http.get(`${environment.apiUrl}/students`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }), // Encabezado con el token
      params: params // Parámetros de paginación y ordenación
    });
  }
}
