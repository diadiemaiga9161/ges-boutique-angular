import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineService } from '../../services/offline.service';

@Component({
  selector: 'app-offline-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline-status" *ngIf="!offlineService.isOnline()">
      <span class="offline-dot"></span>
      Hors ligne
      <span class="pending-badge" *ngIf="offlineService.pendingCount() > 0">
        {{ offlineService.pendingCount() }} en attente
      </span>
    </div>
    <div class="online-sync" *ngIf="offlineService.isOnline() && offlineService.pendingCount() > 0">
      <span class="sync-dot"></span>
      Synchronisation...
    </div>
  `,
  styles: [`
    .offline-status {
      display: inline-flex; align-items: center; gap: 6px;
      background: #fee2e2; color: #991b1b; border-radius: 20px;
      padding: 4px 10px; font-size: 11px; font-weight: 600;
    }
    .online-sync {
      display: inline-flex; align-items: center; gap: 6px;
      background: #fef3c7; color: #92400e; border-radius: 20px;
      padding: 4px 10px; font-size: 11px; font-weight: 600;
    }
    .offline-dot, .sync-dot {
      width: 6px; height: 6px; border-radius: 50%; display: inline-block;
    }
    .offline-dot { background: #dc2626; }
    .sync-dot { background: #f59e0b; animation: pulse 1s linear infinite; }
    .pending-badge {
      background: #dc2626; color: white; border-radius: 10px;
      padding: 1px 6px; font-size: 10px;
    }
    @keyframes pulse { 0%{opacity:1} 50%{opacity:0.3} 100%{opacity:1} }
  `]
})
export class OfflineBadgeComponent {
  constructor(public offlineService: OfflineService) {}
}
