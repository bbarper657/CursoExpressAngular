import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../core/services/notification';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatIconModule, MatBadgeModule, MatListModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {

  notifications: any[] = []; 
  unreadCount: number = 0;
  private subscription: Subscription | undefined;

  constructor(
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {

    this.notificationService.connect(); 
    this.notificationService.loadUserNotifications().subscribe((history) => {
      if (history && history.length > 0) {
        this.notifications = history;
        this.unreadCount = history.length;
      }
    });

    this.subscription = this.notificationService.getNotifications().subscribe((notifs) => {
      if (notifs && Array.isArray(notifs)) {
        notifs.forEach(notification => {
          if (notification && notification.subject && notification.message) {
            this.notifications.unshift(notification); 
            this.unreadCount++; 
          }
        });
      }
    });
  }

  markAllAsRead(): void {
    this.unreadCount = 0;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.notificationService.disconnect(); 
  }
}