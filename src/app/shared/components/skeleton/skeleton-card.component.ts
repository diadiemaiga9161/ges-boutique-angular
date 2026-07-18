import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card" *ngFor="let i of items">
      <div class="sk-header"></div>
      <div class="sk-line w-75"></div>
      <div class="sk-line w-50"></div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: var(--bg-card, #fff);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 10px;
      box-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.08));
    }
    .sk-header {
      height: 20px;
      border-radius: 6px;
      margin-bottom: 10px;
      background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .sk-line {
      height: 14px;
      border-radius: 4px;
      margin-bottom: 6px;
      background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .w-75 { width: 75%; }
    .w-50 { width: 50%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @media (prefers-color-scheme: dark) {
      .skeleton-card { background: #1f2937; }
      .sk-header, .sk-line {
        background: linear-gradient(90deg,#374151 25%,#4b5563 50%,#374151 75%);
        background-size: 200% 100%;
      }
    }
  `]
})
export class SkeletonCardComponent {
  @Input() count = 4;
  get items() { return Array.from({length: this.count}); }
}
