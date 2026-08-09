// src/app/shared/services/ia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// =====================================================
// INTERFACES
// =====================================================

export interface ProfilIA {
  typeBoutique: string;
  joursApprovisionnement: number[];
  objectifStockJours: number;
  margeObjectif: number;
  delaiReglementCredit: number;
}

export interface RecommandationIA {
  id: string;
  type: string;
  priorite: string; // CRITIQUE, HAUTE, MOYENNE, BASSE
  titre: string;
  description: string;
  actionLabel: string;
  scoreConfiance: number;
}

export interface QuestionPredefinie {
  id: string;
  label: string;
  icone: string;
}

export interface AlerteIA {
  type: string;
  message: string;
  severity: string;
}

export interface AnalyseIAResult {
  scoreGlobal: number;
  tendanceCA: string;
  tauxCroissanceMensuel: number;
  previsionCA7Jours: number;
  previsionCA30Jours: number;
  caHier: number;
  caCetteSemaine: number;
  caCeMois: number;
  recommandations: RecommandationIA[];
  alertes: AlerteIA[];
  segmentsClients: { [key: string]: number };
  previsionCA30JoursDetail: { date: string; prevision: number }[];
  precisionModele: number;
}

// =====================================================
// SERVICE
// =====================================================

@Injectable({ providedIn: 'root' })
export class IaService {
  private apiUrl = `${environment.apiUrl}/ia`;

  constructor(private http: HttpClient) {}

  getProfil(): Observable<ProfilIA> {
    return this.http.get<ProfilIA>(`${this.apiUrl}/profil`);
  }

  sauvegarderProfil(profil: ProfilIA): Observable<any> {
    return this.http.post(`${this.apiUrl}/profil`, profil);
  }

  analyser(): Observable<AnalyseIAResult> {
    return this.http.get<AnalyseIAResult>(`${this.apiUrl}/analyse`);
  }

  getRecommandations(): Observable<RecommandationIA[]> {
    return this.http.get<RecommandationIA[]>(`${this.apiUrl}/recommandations`);
  }

  enregistrerFeedback(id: string, statut: 'SUIVIE' | 'IGNOREE'): Observable<any> {
    return this.http.post(`${this.apiUrl}/feedback/${id}`, { statut });
  }

  getScoreSante(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sante`);
  }

  // ==================== ASSISTANT IA (CHAT) ====================

  getQuestionsPredefinies(): Observable<QuestionPredefinie[]> {
    return this.http.get<QuestionPredefinie[]>(`${this.apiUrl}/questions-predefinies`);
  }

  poserQuestion(question: string): Observable<{ reponse: string }> {
    return this.http.post<{ reponse: string }>(`${this.apiUrl}/chat`, { question });
  }
}
