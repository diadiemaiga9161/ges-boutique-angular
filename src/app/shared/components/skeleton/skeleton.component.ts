import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [style.gap.px]="gap">
      <div *ngFor="let i of items" class="skeleton-line"
           [style.height.px]="height" [style.borderRadius.px]="radius"
           [style.width]="widths[i % widths.length]">
      </div>
    </div>
  `,
  styles: [`
    .skeleton-wrapper { display: flex; flex-direction: column; }
    .skeleton-line {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @media (prefers-color-scheme: dark) {
      .skeleton-line {
        background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
        background-size: 200% 100%;
      }
    }
  `]
})
export class SkeletonComponent {
  @Input() count = 5;
  @Input() height = 48;
  @Input() radius = 8;
  @Input() gap = 8;
  @Input() widths: string[] = ['100%', '85%', '92%', '78%', '100%'];
  get items() { return Array.from({length: this.count}, (_, i) => i); }
}
