// src/app/shared/services/dette-ancienne.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface DetteAncienne {
  id: number;
  clientId: number;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  montantInitial: number;
  montantRestant: number;
  montantPaye: number;
  dateCredit: string;
  description?: string;
  estReglee: boolean;
  dateCreation?: string;
  dateDernierReglement?: string;
}

export interface ReglementDette {
  id: number;
  detteId: number;
  montantPaye: number;
  montantRestantApres: number;
  dateReglement: string;
  utilisateurId?: number;
  utilisateurNom?: string;
  modePaiement: string;
  referencePaiement?: string;
  observations?: string;
}

export interface DetteAncienneRequest {
  clientId: number;
  montant: number;
  dateCredit: string;
  description?: string;
}

export interface ReglementDetteRequest {
  detteId: number;
  montantPaye: number;
  utilisateurId?: number;
  modePaiement: string;
  referencePaiement?: string;
  observations?: string;
}

export interface StatistiquesDettes {
  totalDettesInitiales: number;
  totalDettesRestantes: number;
  totalReglementsEffectues: number;
  nombreDettesNonReglees: number;
  nombreDettesReglees: number;
  totalReglementsDuJour: number;
}

export interface StatistiquesClient {
  clientId: number;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  nombreDettes: number;
  nombreDettesNonReglees: number;
  nombreDettesReglees: number;
  totalDettes: number;
  totalRestant: number;
  totalPaye: number;
  dettes: DetteAncienne[];
}

@Injectable({
  providedIn: 'root'
})
export class DetteAncienneService {
  private apiUrl = `${environment.apiUrl}/dettes-anciennes`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('Aucun token trouvé dans localStorage');
        return null;
      }
      return token;
    }
    return null;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any, context: string): Observable<never> {
    console.error(`Erreur lors de ${context}:`, error);
    let message = `Impossible de ${context}`;
    
    if (error.status === 0) {
      message = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else if (error.status === 401) {
      message = 'Session expirée. Veuillez vous reconnecter.';
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    } else if (error.status === 403) {
      message = 'Accès non autorisé à cette ressource.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.error?.error) {
      message = error.error.error;
    } else if (typeof error.error === 'string') {
      message = error.error;
    }
    
    return throwError(() => new Error(message));
  }

  private extractData<T>(response: any): T {
    if (!response) return {} as T;
    if (response.success === false) {
      throw new Error(response.message || response.error || 'Erreur inconnue');
    }
    if (response.dette) return response.dette as T;
    if (response.dettes) return response.dettes as T;
    if (response.reglement) return response.reglement as T;
    if (response.reglements) return response.reglements as T;
    if (response.statistiques) return response.statistiques as T;
    if (response.data) return response.data as T;
    return response as T;
  }

  // ==================== GESTION DES DETTES ====================

  creerDette(request: DetteAncienneRequest): Observable<DetteAncienne> {
    return this.http.post(this.apiUrl, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<DetteAncienne>(response)),
      catchError(error => this.handleError(error, 'créer la dette'))
    );
  }

  modifierDette(id: number, request: DetteAncienneRequest): Observable<DetteAncienne> {
    return this.http.put(`${this.apiUrl}/${id}`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<DetteAncienne>(response)),
      catchError(error => this.handleError(error, 'modifier la dette'))
    );
  }

  getDetteById(id: number): Observable<DetteAncienne> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<DetteAncienne>(response)),
      catchError(error => this.handleError(error, `récupérer la dette ${id}`))
    );
  }

  getAllDettes(): Observable<DetteAncienne[]> {
    return this.http.get(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<DetteAncienne[]>(response) || []),
      catchError(error => this.handleError(error, 'récupérer toutes les dettes'))
    );
  }

  getDettesParClient(clientId: number): Observable<DetteAncienne[]> {
    return this.http.get(`${this.apiUrl}/client/${clientId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<DetteAncienne[]>(response) || []),
      catchError(error => this.handleError(error, 'récupérer les dettes du client'))
    );
  }

  getDettesNonReglees(): Observable<DetteAncienne[]> {
    return this.http.get(`${this.apiUrl}/non-reglees`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<DetteAncienne[]>(response) || []),
      catchError(error => this.handleError(error, 'récupérer les dettes non réglées'))
    );
  }

  getDettesReglees(): Observable<DetteAncienne[]> {
    return this.http.get(`${this.apiUrl}/reglees`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<DetteAncienne[]>(response) || []),
      catchError(error => this.handleError(error, 'récupérer les dettes réglées'))
    );
  }

  rechercherDettes(query: string): Observable<DetteAncienne[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get(`${this.apiUrl}/recherche`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => this.extractData<DetteAncienne[]>(response) || []),
      catchError(error => this.handleError(error, 'rechercher les dettes'))
    );
  }

  supprimerDette(id: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, `supprimer la dette ${id}`))
    );
  }

  // ==================== GESTION DES RÈGLEMENTS ====================

  enregistrerReglement(request: ReglementDetteRequest): Observable<ReglementDette> {
    return this.http.post(`${this.apiUrl}/reglement`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ReglementDette>(response)),
      catchError(error => this.handleError(error, 'enregistrer le règlement'))
    );
  }

  getHistoriqueReglements(detteId: number): Observable<ReglementDette[]> {
    return this.http.get(`${this.apiUrl}/${detteId}/reglements`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ReglementDette[]>(response) || []),
      catchError(error => this.handleError(error, 'récupérer l\'historique des règlements'))
    );
  }

  getReglementsParPeriode(dateDebut: string, dateFin: string): Observable<ReglementDette[]> {
    let params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get(`${this.apiUrl}/reglements/periode`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => this.extractData<ReglementDette[]>(response) || []),
      catchError(error => this.handleError(error, 'récupérer les règlements par période'))
    );
  }

  // ==================== STATISTIQUES ====================

  getStatistiquesGlobales(): Observable<StatistiquesDettes> {
    return this.http.get(`${this.apiUrl}/statistiques/globales`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<StatistiquesDettes>(response)),
      catchError(error => this.handleError(error, 'récupérer les statistiques globales'))
    );
  }

  getStatistiquesParClient(clientId: number): Observable<StatistiquesClient> {
    return this.http.get(`${this.apiUrl}/statistiques/client/${clientId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<StatistiquesClient>(response)),
      catchError(error => this.handleError(error, 'récupérer les statistiques du client'))
    );
  }

  getStatistiquesReglementsParPeriode(dateDebut: string, dateFin: string): Observable<any> {
    let params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get(`${this.apiUrl}/statistiques/reglements`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => this.extractData<any>(response)),
      catchError(error => this.handleError(error, 'récupérer les statistiques des règlements'))
    );
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  getMontantRestantTotal(dettes: DetteAncienne[]): number {
    return dettes.reduce((total, dette) => total + (dette.montantRestant || 0), 0);
  }

  getMontantPayeTotal(dettes: DetteAncienne[]): number {
    return dettes.reduce((total, dette) => total + (dette.montantPaye || 0), 0);
  }

  getMontantInitialTotal(dettes: DetteAncienne[]): number {
    return dettes.reduce((total, dette) => total + (dette.montantInitial || 0), 0);
  }

  getPourcentagePaye(dette: DetteAncienne): number {
    if (!dette.montantInitial || dette.montantInitial === 0) return 0;
    const paye = dette.montantInitial - dette.montantRestant;
    return (paye / dette.montantInitial) * 100;
  }

  getStatutDette(dette: DetteAncienne): string {
    if (dette.estReglee) return 'RÉGLÉE';
    if (dette.montantRestant === dette.montantInitial) return 'NON PAYÉE';
    return 'PARTIELLEMENT PAYÉE';
  }

  getStatutClass(dette: DetteAncienne): string {
    if (dette.estReglee) return 'badge-success';
    if (dette.montantRestant === dette.montantInitial) return 'badge-danger';
    return 'badge-warning';
  }
}