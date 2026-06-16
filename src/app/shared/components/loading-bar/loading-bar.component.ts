import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div class="global-loading-bar" *ngIf="loading$ | async">
      <div class="global-loading-progress"></div>
    </div>
  `,
  styles: [`
    .global-loading-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 3px;
      z-index: 9999;
      background: rgba(59,130,246,.15);
    }
    .global-loading-progress {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #10b981, #3b82f6);
      background-size: 200% 100%;
      animation: loading-slide 1.2s linear infinite;
    }
    @keyframes loading-slide {
      0%   { background-position: 200% 0; width: 40%; }
      50%  { width: 70%; }
      100% { background-position: -200% 0; width: 100%; }
    }
  `]
})
export class LoadingBarComponent {
  loading$ = this.loadingService.loading$;
  constructor(private loadingService: LoadingService) {}
}
