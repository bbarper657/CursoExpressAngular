import { Injectable, PLATFORM_ID, Inject, Injector } from '@angular/core';
import { Client, IMessage, StompHeaders } from '@stomp/stompjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private stompClient: Client | null = null; // Cliente STOMP para WebSocket
  private notificationsSubject = new BehaviorSubject<any[]>([]); // Estado reactivo para almacenar notificaciones
  private apiUrl = `${environment.webSocketUrl}/notifications`; // URL del WebSocket para notificaciones
  private authService!: AuthService; // Servicio de autenticación para obtener el token

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private injector: Injector // Se usa para objener AuthService de forma diferida
  ) { }

  /**
   * Conecta al WebSocket de notificaciones
  */
  connect(): void {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService); // Obtener AuthService de forma diferida para evitar problemas de inyección circular
    }

    const token = this.authService?.getToken(); // Obtener el token de autenticación
    const username = this.authService?.getUsername(); // Obtener el nombre de usuario

    if (!token || !username) {
      console.error("No hay token o usuario autenticado, WebSocket no se conectará.");
      return;
    }

    if (this.stompClient && this.stompClient.connected) {
      console.warn("WebSocket ya está conectado.");
      return;
    }

    // Configuración del cliente STOMP
    this.stompClient = new Client({
      brokerURL: `${environment.webSocketBroker}`, // URL del servidor WebSocket
      reconnectDelay: 5000, // Intentar reconectar cada 5 segundos si la conexión se pierde
      debug: (msg) => console.log('STOMP Debug:', msg), // Habilitar depuración para ver mensajes de conexión
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Agregar token en los encabezados de conexión
      },
    });

    this.stompClient.onConnect = () => {
      console.log("WebSocket conectado.");

      const token = this.authService?.getToken(); // Obtener el token de autenticación
      const username = this.authService?.getUsername(); // Obtener el nombre de usuario

      console.log(`Usuario autenticado en WebSocket: ${username}`);
      console.log(`Token: ${token ? 'Existe' : 'No encontrado'}`);

      const headers: StompHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      // Suscribirse al canal de notificaciones para el usuario autenticado
      this.stompClient?.subscribe(
        `topic/notifications`,
        (message: IMessage) => {
          try {
            const notification = JSON.parse(message.body); // Parsear el mensaje recibido
            console.log("Notificación recibida:", notification);

            // Agregar la notificación a la lista existente
            const currentNotifications = this.notificationsSubject.value;
            this.notificationsSubject.next([...currentNotifications, notification]); // Emitir la nueva lista de notificaciones
          } catch (error) {
            console.error("Error al procesar la notificación:", error);
          }
        },
        headers // Solo si el token está presente
      );
    };

    // Gestión de errores STOMP
    this.stompClient.onStompError = (frame) => {
      console.error("Error en STOMP:", frame.headers['message']);
    };

    this.stompClient.activate(); // Activar la conexión WebSocket
  }

  /**
   * Obtiene el historial de notificaciones desde MongoDB (REST API)
   * Se realiza una petición HTTP a la API de notificaciones
   * @return Observable con la lista de notificaciones
   */
  loadUserNotifications(): Observable<any[]> {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService); // Obtener AuthService de forma diferida para evitar problemas de inyección circular
    }

    const token = this.authService.getToken(); // Obtener el token de autenticación
    if (!token) {
      console.error("No hay token disponible.");
      return of([]); // Retornar un observable vacío si no hay token
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` }); // Agregar token en los encabezados de la solicitud

    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      tap(notifications => console.log("Notificaciones cargadas:", notifications)), // Log de las notificaciones recibidas
    );
  }

  /**
   * Devuelve un Observable con las notificaciones en tiempo real
   * @return Observable con la lista de notificaciones actualizadas
   */
  getNotifications(): Observable<any[]> {
    return this.notificationsSubject.asObservable().pipe(
      tap((notifs) => console.log("Notificaciones actualizadas en tiempo real:", notifs)) // Log de las notificaciones emitidas
    ); // Retornar el Observable para que los componentes puedan suscribirse a las notificaciones
  }

  /**
   * Desconecta el WebSocket
   * Si el cliente STOMP está conectado, se desactiva la conexión para liberar recursos
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate(); // Desactivar la conexión WebSocket
      console.log("WebSocket desconectado.");
    }
  }
}