// src/app/shared/services/fidelite.service.ts
//
// Programme de fidélité client (voir CleFonctionnalite.PROGRAMME_FIDELITE côté backend,
// masqué automatiquement si désactivé via BoutiqueService.fonctionnalitesAvancees$ —
// même mécanisme que Dépôt garde / Comptes bancaires, voir NavigationService).
//
// L'utilisation des points pendant une vente se fait en 2 temps côté appelant
// (voir VentesComponent) : appliquer la réduction correspondante via le mécanisme de
// remise déjà existant (VenteRequest.remiseGlobale / typeRemiseGlobale = MONTANT_FIXE),
// PUIS appeler utiliserPoints() une fois la vente créée pour débiter réellement le solde.
// Ce service ne touche jamais au calcul du montant d'une vente.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ParametresFidelite {
  /** FCFA dépensés par le client pour gagner 1 point. */
  montantParPoint: number;
  /** Valeur en FCFA d'1 point au moment de l'utiliser. */
  pointValeur: number;
}

export interface SoldeFidelite {
  points: number;
  valeurFcfa: number;
}

export type TypeMouvementFidelite = 'GAGNE' | 'UTILISE' | 'AJUSTEMENT';

export interface MouvementFidelite {
  id?: number;
  type: TypeMouvementFidelite;
  /** Signé : positif pour GAGNE/AJUSTEMENT positif, négatif pour UTILISE/AJUSTEMENT négatif. */
  points: number;
  venteId?: number | null;
  motif?: string | null;
  dateMouvement: string;
  annule?: boolean;
}

export interface UtiliserPointsResponse {
  success: boolean;
  message?: string;
  solde?: SoldeFidelite;
}

export interface AjusterSoldeResponse {
  success: boolean;
  message?: string;
  solde?: SoldeFidelite;
}

@Injectable({ providedIn: 'root' })
export class FideliteService {
  private apiUrl = `${environment.apiUrl}/fidelite`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private handleError(error: any, context: string): Observable<never> {
    console.error(`Erreur lors de ${context}:`, error);
    let message = `Impossible de ${context}`;
    if (error.status === 0) {
      message = 'Impossible de se connecter au serveur';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (typeof error.error === 'string') {
      message = error.error;
    }
    return throwError(() => new Error(message));
  }

  /** ADMIN ou VENDEUR — voir GET /api/fidelite/parametres. */
  getParametres(): Observable<ParametresFidelite> {
    return this.http.get<ParametresFidelite>(`${this.apiUrl}/parametres`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'récupérer les paramètres de fidélité'))
    );
  }

  /** N'importe quel ADMIN (pas besoin de super admin) — voir PUT /api/fidelite/parametres. */
  updateParametres(parametres: ParametresFidelite): Observable<ParametresFidelite> {
    return this.http.put<ParametresFidelite>(`${this.apiUrl}/parametres`, parametres, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'mettre à jour les paramètres de fidélité'))
    );
  }

  /** ADMIN ou VENDEUR — solde de points d'un client et sa valeur en FCFA au taux actuel. */
  getSoldeClient(clientId: number): Observable<SoldeFidelite> {
    return this.http.get<SoldeFidelite>(`${this.apiUrl}/clients/${clientId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'récupérer le solde de fidélité du client'))
    );
  }

  /** ADMIN ou VENDEUR — historique des mouvements de points (GAGNE/UTILISE/AJUSTEMENT). */
  getMouvementsClient(clientId: number): Observable<MouvementFidelite[]> {
    return this.http.get<any>(`${this.apiUrl}/clients/${clientId}/mouvements`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(response => (Array.isArray(response) ? response : (response?.mouvements || response?.data || []))),
      catchError(error => this.handleError(error, 'récupérer l\'historique des points de fidélité'))
    );
  }

  /**
   * Débite le solde du client de `points`, rattaché à `venteId` (pour que l'annulation
   * future de la vente restaure les points automatiquement côté serveur). Répond
   * {success:false, message:...} en HTTP 400 en cas de solde insuffisant — traité ici
   * comme une réponse normale (pas une exception) pour laisser l'appelant décider
   * de la suite (la vente est déjà créée et payée à ce stade).
   */
  utiliserPoints(clientId: number, points: number, venteId: number): Observable<UtiliserPointsResponse> {
    return this.http.post<UtiliserPointsResponse>(`${this.apiUrl}/clients/${clientId}/utiliser`, { points, venteId }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error?.error && typeof error.error === 'object' && 'success' in error.error) {
          return [error.error as UtiliserPointsResponse];
        }
        return this.handleError(error, 'utiliser les points de fidélité');
      })
    );
  }

  /** Réservé à ADMIN — ajustement manuel du solde, positif ou négatif. */
  ajusterSolde(clientId: number, delta: number, motif: string): Observable<AjusterSoldeResponse> {
    return this.http.patch<AjusterSoldeResponse>(`${this.apiUrl}/clients/${clientId}/ajuster`, { delta, motif }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'ajuster le solde de fidélité'))
    );
  }
}
