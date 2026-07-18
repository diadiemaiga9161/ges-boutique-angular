import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartsService } from '../../services/charts.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="charts-grid">
      <!-- CA 30 jours -->
      <div class="chart-card" *ngIf="caOptions">
        <h6 class="chart-title">Chiffre d'affaires — 30 derniers jours</h6>
        <apx-chart
          [series]="caOptions.series!"
          [chart]="caOptions.chart!"
          [xaxis]="caOptions.xaxis!"
          [yaxis]="caOptions.yaxis!"
          [dataLabels]="caOptions.dataLabels!"
          [stroke]="caOptions.stroke!"
          [fill]="caOptions.fill!"
          [tooltip]="caOptions.tooltip!"
          [grid]="caOptions.grid!">
        </apx-chart>
      </div>

      <!-- Top produits -->
      <div class="chart-card" *ngIf="topProduitsOptions">
        <h6 class="chart-title">Top 10 produits vendus</h6>
        <apx-chart
          [series]="topProduitsOptions.series!"
          [chart]="topProduitsOptions.chart!"
          [xaxis]="topProduitsOptions.xaxis!"
          [plotOptions]="topProduitsOptions.plotOptions!"
          [dataLabels]="topProduitsOptions.dataLabels!"
          [colors]="topProduitsOptions.colors!"
          [tooltip]="topProduitsOptions.tooltip!">
        </apx-chart>
      </div>

      <!-- Alertes stock IA -->
      <div class="chart-card chart-card--full" *ngIf="alertesStock.length > 0">
        <h6 class="chart-title">
          <span class="alert-dot"></span>
          Alertes stock — Ruptures prevues
        </h6>
        <div class="alerte-list">
          <div class="alerte-item" *ngFor="let a of alertesStock" [class.rupture]="a.ruptureImminente">
            <div class="alerte-nom">{{ a.produitNom }}</div>
            <div class="alerte-detail">
              <span class="badge" [class.bg-danger]="a.ruptureImminente" [class.bg-warning]="!a.ruptureImminente">
                {{ a.ruptureImminente ? 'Rupture imminente' : 'Alerte stock' }}
              </span>
              <span class="alerte-jours" *ngIf="a.joursAvantRupture >= 0">
                {{ a.joursAvantRupture === 0 ? 'En rupture' : 'Dans ' + a.joursAvantRupture + ' jour(s)' }}
              </span>
              <span class="alerte-stock">Stock : {{ a.stockActuel }}</span>
              <span class="alerte-reappro" *ngIf="a.quantiteReappro > 0">
                Commander : {{ a.quantiteReappro }} unites
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      padding: 0 0 16px;
    }
    .chart-card {
      background: var(--bg-card, #fff);
      border-radius: 14px;
      padding: 16px;
      box-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.08));
    }
    .chart-card--full { grid-column: 1 / -1; }
    .chart-title {
      font-size: 13px; font-weight: 700;
      color: var(--text-primary, #212529);
      margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
    }
    .alert-dot {
      width: 8px; height: 8px; background: #ef4444;
      border-radius: 50%; display: inline-block;
      animation: blink 1.5s ease-in-out infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .alerte-list { display: flex; flex-direction: column; gap: 8px; }
    .alerte-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; border-radius: 8px;
      background: var(--bg-secondary, #f8f9fa);
      border-left: 4px solid #f59e0b;
      flex-wrap: wrap; gap: 8px;
    }
    .alerte-item.rupture { border-left-color: #ef4444; }
    .alerte-nom { font-weight: 600; font-size: 13px; color: var(--text-primary); }
    .alerte-detail { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .alerte-jours, .alerte-stock, .alerte-reappro { font-size: 12px; color: var(--text-secondary); }
    .badge { font-size: 11px; border-radius: 20px; padding: 2px 8px; }
    .bg-danger { background: #fee2e2 !important; color: #991b1b !important; }
    .bg-warning { background: #fef3c7 !important; color: #92400e !important; }
    @media (max-width: 767px) { .charts-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardChartsComponent implements OnInit {
  caOptions: any = null;
  topProduitsOptions: any = null;
  alertesStock: any[] = [];
  isLoading = true;

  constructor(
    private chartsService: ChartsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      ca: this.chartsService.getCA30Jours().pipe(catchError(() => of([]))),
      top: this.chartsService.getTopProduits().pipe(catchError(() => of([]))),
      previsions: this.chartsService.getPrevisions().pipe(catchError(() => of([])))
    }).subscribe(({ ca, top, previsions }) => {
      if (ca.length > 0) this.buildCAChart(ca);
      if (top.length > 0) this.buildTopProduitsChart(top);
      if (previsions.length > 0) {
        this.alertesStock = previsions.filter((p: any) => p.alerteRupture || p.ruptureImminente).slice(0, 8);
      }
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  private buildCAChart(data: any[]): void {
    const labels = data.map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    });
    const values = data.map((d: any) => d.ca || 0);

    this.caOptions = {
      series: [{ name: 'CA (FCFA)', data: values }],
      chart: { type: 'area', height: 220, toolbar: { show: false }, sparkline: { enabled: false } },
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 } },
      xaxis: { categories: labels, labels: { style: { fontSize: '10px' } }, tickAmount: 7 },
      yaxis: { labels: { formatter: (v: number) => v.toLocaleString('fr-FR') + ' F', style: { fontSize: '10px' } } },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: '#e2e8f0' },
      colors: ['#1a56db'],
      tooltip: { y: { formatter: (v: number) => v.toLocaleString('fr-FR') + ' FCFA' } }
    };
  }

  private buildTopProduitsChart(data: any[]): void {
    const top10 = data.slice(0, 10);
    this.topProduitsOptions = {
      series: [{ name: 'Quantite vendue', data: top10.map((p: any) => p.quantiteVendue || p.quantite || 0) }],
      chart: { type: 'bar', height: 220, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 6, horizontal: true } },
      xaxis: { categories: top10.map((p: any) => p.produitNom || p.nom || ''), labels: { style: { fontSize: '10px' } } },
      dataLabels: { enabled: false },
      colors: ['#1a56db'],
      tooltip: { y: { formatter: (v: number) => v + ' unites' } }
    };
  }
}
