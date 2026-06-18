import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';

interface OperationMM {
  id: number;
  numeroVente: string;
  dateVente: string;
  montantTotal: number;
  modePaiement: string;
  referencePaiement: string;
  clientNom: string;
  vendeurNom: string;
}

interface ResumeMM {
  orangeMoney: number;
  moovMoney: number;
  waveMoney: number;
  total: number;
  nombreOrange: number;
  nombreMoov: number;
  nombreWave: number;
  nombreTotal: number;
}

@Component({
  selector: 'app-mobile-money',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mobile-money.component.html',
  styleUrls: ['./mobile-money.component.scss']
})
export class MobileMoneyComponent implements OnInit {
  activeTab: 'operations' | 'resume' | 'telecharger' = 'operations';
  type = 'TOUS';
  periode = 'JOUR';
  operations: OperationMM[] = [];
  totalOrange = 0;
  totalMoov = 0;
  totalWave = 0;
  totalGlobal = 0;
  nombreOperations = 0;
  resume: Record<string, ResumeMM> | null = null;
  loading = false;

  periodes = [
    { value: 'JOUR', label: "Aujourd'hui" },
    { value: 'SEMAINE', label: 'Cette semaine' },
    { value: 'MOIS', label: 'Ce mois' },
    { value: 'ANNEE', label: 'Cette année' }
  ];

  resumePeriodes = [
    { key: 'jour', label: "Aujourd'hui" },
    { key: 'semaine', label: 'Cette semaine' },
    { key: 'mois', label: 'Ce mois' },
    { key: 'annee', label: 'Cette année' }
  ];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.chargerDonnees();
    this.chargerResume();
  }

  private headers(): HttpHeaders {
    const token = this.auth.getToken() || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  chargerDonnees() {
    this.loading = true;
    this.http.get<any>(`/api/mobile-money/operations?type=${this.type}&periode=${this.periode}`,
      { headers: this.headers() })
      .subscribe({
        next: (data) => {
          this.operations = data.operations || [];
          this.totalOrange = data.totalOrangeMoney || 0;
          this.totalMoov = data.totalMoovMoney || 0;
          this.totalWave = data.totalWaveMoney || 0;
          this.totalGlobal = data.totalGlobal || 0;
          this.nombreOperations = data.nombreOperations || 0;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  chargerResume() {
    this.http.get<any>('/api/mobile-money/resume', { headers: this.headers() })
      .subscribe({ next: (data) => { this.resume = data; } });
  }

  exportCsv(operateur: string = 'TOUS') {
    const url = `/api/mobile-money/export/csv?type=${operateur}&periode=${this.periode}`;
    const link = document.createElement('a');
    link.href = url;
    const nom = operateur.toLowerCase().replace('_money', '');
    link.setAttribute('download', `mobile-money-${nom}-${this.periode.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  periodeLabel(): string {
    return this.periodes.find(p => p.value === this.periode)?.label || this.periode;
  }

  operateurLabel(type: string): string {
    const labels: Record<string, string> = {
      ORANGE_MONEY: 'Orange Money', MOOV_MONEY: 'Moov Money',
      WAVE_MONEY: 'Wave', TOUS: 'Tous'
    };
    return labels[type] || type;
  }

  modeIcon(mode: string): string {
    if (mode === 'ORANGE_MONEY') return '🟠';
    if (mode === 'MOOV_MONEY') return '🔵';
    if (mode === 'WAVE_MONEY') return '🌊';
    return '💰';
  }

  modeBadgeClass(mode: string): string {
    if (mode === 'ORANGE_MONEY') return 'badge bg-warning text-dark';
    if (mode === 'MOOV_MONEY') return 'badge bg-info text-white';
    if (mode === 'WAVE_MONEY') return 'badge text-white' ;
    return 'badge bg-secondary';
  }

  modeBadgeStyle(mode: string): string {
    if (mode === 'WAVE_MONEY') return 'background-color:#7c3aed';
    return '';
  }

  formatMontant(m: number): string {
    return new Intl.NumberFormat('fr-FR').format(m) + ' F';
  }

  getResume(key: string): ResumeMM {
    const empty: ResumeMM = { orangeMoney: 0, moovMoney: 0, waveMoney: 0, total: 0, nombreOrange: 0, nombreMoov: 0, nombreWave: 0, nombreTotal: 0 };
    return this.resume?.[key] || empty;
  }
}
