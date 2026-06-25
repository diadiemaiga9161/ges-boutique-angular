import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { BeneficeService, BeneficeData } from '../../../shared/services/benefice.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

Chart.register(...registerables);

type Periode = 'JOURNALIER' | 'HEBDOMADAIRE' | 'MENSUEL' | 'ANNUEL';

@Component({
  selector: 'app-benefices',
  templateUrl: './benefices.component.html',
  styleUrls: ['./benefices.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class BeneficesComponent implements OnInit, OnDestroy {

  periodeActive: Periode = 'JOURNALIER';
  isLoading = false;
  data: BeneficeData | null = null;
  erreur = '';

  dateJour = new Date().toISOString().split('T')[0];
  moisSelect = new Date().getMonth() + 1;
  anneeSelect = new Date().getFullYear();
  annees = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  mois = [
    { v: 1, l: 'Janvier' }, { v: 2, l: 'Février' }, { v: 3, l: 'Mars' },
    { v: 4, l: 'Avril' },   { v: 5, l: 'Mai' },     { v: 6, l: 'Juin' },
    { v: 7, l: 'Juillet' }, { v: 8, l: 'Août' },    { v: 9, l: 'Septembre' },
    { v: 10, l: 'Octobre'}, { v: 11, l: 'Novembre'},{ v: 12, l: 'Décembre' }
  ];

  @ViewChild('beneficeChart', { static: false }) chartRef!: ElementRef;
  private chart: Chart | undefined;
  private subs: Subscription[] = [];

  constructor(private beneficeService: BeneficeService) {}

  ngOnInit(): void {
    this.charger();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.chart?.destroy();
  }

  selectionner(p: Periode): void {
    this.periodeActive = p;
    this.charger();
  }

  charger(): void {
    this.isLoading = true;
    this.erreur = '';
    this.chart?.destroy();

    let obs$;
    switch (this.periodeActive) {
      case 'JOURNALIER':   obs$ = this.beneficeService.journalier(this.dateJour); break;
      case 'HEBDOMADAIRE': obs$ = this.beneficeService.hebdomadaire(); break;
      case 'MENSUEL':      obs$ = this.beneficeService.mensuel(this.moisSelect, this.anneeSelect); break;
      case 'ANNUEL':       obs$ = this.beneficeService.annuel(this.anneeSelect); break;
    }

    const sub = obs$.subscribe({
      next: (d) => {
        this.data = d;
        this.isLoading = false;
        setTimeout(() => this.dessinerChart(), 100);
      },
      error: (e) => {
        this.erreur = e.message;
        this.isLoading = false;
      }
    });
    this.subs.push(sub);
  }

  exporterPDF(): void {
    if (!this.data) return;
    try {
      this.beneficeService.exporterPDF(this.data);
      Swal.fire({ icon: 'success', title: 'PDF généré !', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Erreur PDF', text: 'Impossible de générer le PDF' });
    }
  }

  private dessinerChart(): void {
    if (!this.data || !this.chartRef) return;
    this.chart?.destroy();
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data.lignes.map(l => l.label),
        datasets: [{
          label: 'Bénéfice (FCFA)',
          data: this.data.lignes.map(l => l.benefice),
          backgroundColor: this.data.lignes.map(l => l.benefice >= 0 ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)'),
          borderColor:      this.data.lignes.map(l => l.benefice >= 0 ? '#10b981' : '#ef4444'),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Bénéfice : ${this.fmt(ctx.raw as number)}`
            }
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v) => this.fmt(v as number) } }
        }
      }
    });
  }

  fmt(v: number): string { return this.beneficeService.formaterPrix(v); }

  get evolution(): number { return this.data?.evolution ?? 0; }
  get evolutionClass(): string {
    return this.evolution > 0 ? 'text-success' : this.evolution < 0 ? 'text-danger' : 'text-muted';
  }
  get evolutionIcon(): string {
    return this.evolution > 0 ? 'i-Arrow-Up' : this.evolution < 0 ? 'i-Arrow-Down' : 'i-Line-Chart';
  }
}
