// src/app/views/pages/ia/ia.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  IaService,
  ProfilIA,
  RecommandationIA,
  AnalyseIAResult
} from '../../../shared/services/ia.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AssistantIaComponent } from '../assistant-ia/assistant-ia.component';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AssistantIaComponent],
  templateUrl: './ia.component.html',
  styleUrls: ['./ia.component.scss']
})
export class IaComponent implements OnInit {

  // ==================== ONGLETS ====================
  activeTab: 'dashboard' | 'reco' | 'clients' | 'chat' = 'dashboard';

  // ==================== ÉTAT ====================
  isLoading = false;
  errorMessage = '';

  // ==================== DONNÉES ====================
  analyse: AnalyseIAResult | null = null;
  recommandations: RecommandationIA[] = [];
  recommandationsTraitees = new Set<string>();

  // ==================== WIZARD ====================
  showWizard = false;
  wizardStep = 1;
  isSavingProfil = false;
  profil: ProfilIA = {
    typeBoutique: 'ALIMENTATION',
    joursApprovisionnement: [],
    objectifStockJours: 14,
    margeObjectif: 20,
    delaiReglementCredit: 30
  };

  // ==================== CONSTANTES WIZARD ====================
  readonly typesBoutique = ['ALIMENTATION', 'TEXTILE', 'ELECTRONIQUE', 'PHARMACIE', 'MIXTE', 'AUTRE'];
  readonly joursSemaine = [
    { label: 'Lun', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Mer', value: 3 },
    { label: 'Jeu', value: 4 },
    { label: 'Ven', value: 5 },
    { label: 'Sam', value: 6 }
  ];
  readonly optionsStock   = [7, 14, 21, 30, 45, 60];
  readonly optionsMarge   = [10, 15, 20, 25, 30, 40, 50];
  readonly optionsCredit  = [7, 15, 30, 45, 60];

  // ==================== SVG SCORE ====================
  readonly svgRadius = 45;
  readonly svgCircumference = 2 * Math.PI * this.svgRadius; // ≈ 282.74

  // ==================== SEGMENTS ====================
  private readonly segmentMeta: { [key: string]: { color: string; bg: string; label: string } } = {
    CHAMPIONS:  { color: '#92400e', bg: '#fef3c7', label: 'Champions'         },
    LOYAUX:     { color: '#15803d', bg: '#dcfce7', label: 'Loyaux'             },
    POTENTIELS: { color: '#1d4ed8', bg: '#dbeafe', label: 'Potentiels'         },
    A_RISQUE:   { color: '#c2410c', bg: '#ffedd5', label: 'À risque'           },
    ENDORMIS:   { color: '#b91c1c', bg: '#fee2e2', label: 'Endormis'           },
    NOUVEAUX:   { color: '#7c3aed', bg: '#ede9fe', label: 'Nouveaux'           }
  };

  constructor(private iaService: IaService) {}

  ngOnInit(): void {
    this.chargerProfil();
  }

  // ==================== CHARGEMENT ====================

  chargerProfil(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.iaService.getProfil().subscribe({
      next: (profil) => {
        this.profil = profil;
        this.showWizard = false;
        this.chargerAnalyse();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.showWizard = true;
          this.isLoading = false;
        } else {
          this.errorMessage = 'Erreur de chargement du profil IA';
          this.isLoading = false;
        }
      }
    });
  }

  chargerAnalyse(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.iaService.analyser().subscribe({
      next: (analyse) => {
        this.analyse = analyse;
        this.recommandations = analyse.recommandations || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'analyse IA';
        this.isLoading = false;
      }
    });
  }

  // ==================== SVG SCORE ====================

  get scoreDashOffset(): number {
    const score = this.analyse?.scoreGlobal ?? 0;
    return this.svgCircumference * (1 - score / 100);
  }

  get scoreColor(): string {
    const score = this.analyse?.scoreGlobal ?? 0;
    if (score >= 70) return '#16a34a';
    if (score >= 40) return '#d97706';
    return '#dc2626';
  }

  // ==================== TENDANCE ====================

  get tendanceIcon(): string {
    const t = this.analyse?.tendanceCA || '';
    if (t === 'HAUSSE') return '↑';
    if (t === 'BAISSE') return '↓';
    return '→';
  }

  get tendanceClass(): string {
    const t = this.analyse?.tendanceCA || '';
    if (t === 'HAUSSE') return 'text-success';
    if (t === 'BAISSE') return 'text-danger';
    return 'text-secondary';
  }

  // ==================== GRAPHIQUE ====================

  get previsions7(): { date: string; prevision: number }[] {
    return (this.analyse?.previsionCA30JoursDetail || []).slice(0, 7);
  }

  getMaxPrevision(): number {
    const vals = (this.analyse?.previsionCA30JoursDetail || []).map(d => d.prevision);
    return vals.length ? Math.max(...vals) : 1;
  }

  getBarWidth(value: number): string {
    const max = this.getMaxPrevision();
    return max > 0 ? `${(value / max) * 100}%` : '0%';
  }

  // ==================== RECOMMANDATIONS ====================

  getBadgeClass(priorite: string): string {
    const map: { [k: string]: string } = {
      CRITIQUE: 'badge-critique',
      HAUTE:    'badge-haute',
      MOYENNE:  'badge-moyenne',
      BASSE:    'badge-basse'
    };
    return map[priorite] || 'badge-basse';
  }

  suivreReco(reco: RecommandationIA): void {
    this.recommandationsTraitees.add(reco.id);
    this.iaService.enregistrerFeedback(reco.id, 'SUIVIE').subscribe();
  }

  ignorerReco(reco: RecommandationIA): void {
    this.recommandationsTraitees.add(reco.id);
    this.iaService.enregistrerFeedback(reco.id, 'IGNOREE').subscribe();
  }

  isTraitee(id: string): boolean {
    return this.recommandationsTraitees.has(id);
  }

  // ==================== SEGMENTS ====================

  getSegmentEntries(): { key: string; value: number }[] {
    if (!this.analyse?.segmentsClients) return [];
    return Object.entries(this.analyse.segmentsClients)
      .map(([key, value]) => ({ key, value }));
  }

  getSegmentColor(key: string): string {
    return this.segmentMeta[key]?.color || '#6b7280';
  }

  getSegmentBg(key: string): string {
    return this.segmentMeta[key]?.bg || '#f9fafb';
  }

  getSegmentLabel(key: string): string {
    return this.segmentMeta[key]?.label || key;
  }

  // ==================== WIZARD ====================

  get wizardProgress(): number {
    return (this.wizardStep / 5) * 100;
  }

  toggleJour(value: number): void {
    const idx = this.profil.joursApprovisionnement.indexOf(value);
    if (idx >= 0) {
      this.profil.joursApprovisionnement.splice(idx, 1);
    } else {
      this.profil.joursApprovisionnement.push(value);
    }
  }

  isJourSelected(value: number): boolean {
    return this.profil.joursApprovisionnement.includes(value);
  }

  wizardSuivant(): void {
    if (this.wizardStep < 5) {
      this.wizardStep++;
    } else {
      this.terminerWizard();
    }
  }

  terminerWizard(): void {
    this.isSavingProfil = true;
    this.iaService.sauvegarderProfil(this.profil).subscribe({
      next: () => {
        this.showWizard = false;
        this.isSavingProfil = false;
        this.chargerAnalyse();
      },
      error: () => {
        this.showWizard = false;
        this.isSavingProfil = false;
        this.chargerAnalyse();
      }
    });
  }
}
