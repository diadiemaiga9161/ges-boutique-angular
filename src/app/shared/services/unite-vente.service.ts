// src/app/shared/services/unite-vente.service.ts
//
// Nouveau système "Vente en gros / détail" (simple) — NE PAS confondre avec l'ancien
// système ProduitNiveau (Carton→Cartouche→Pièce, stocks séparés, décomposition manuelle,
// voir produit-niveau.service.ts). Ici le produit garde UN SEUL stock (Produit.quantite) ;
// chaque "unité de vente" (ex: Carton, Cartouche) n'est qu'un facteur de conversion vers
// l'unité de base du produit (Produit.uniteBase) + un prix de vente/achat propre à cette
// unité. La déduction de stock à la vente se fait directement sur le stock unique
// (quantité vendue × facteurBase), sans étape de décomposition.
//
// Visible seulement si la fonctionnalité avancée CleFonctionnalite.VENTE_GROS_DETAIL est
// active (voir BoutiqueService.fonctionnalitesAvancees$, même mécanisme que Dépôt garde /
// Comptes bancaires).

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface UniteVente {
  id: number;
  nom: string;
  /** Facteur total déjà calculé par le serveur vers l'unité de base du produit
   *  (ex: 1 Carton = 20 Pièces → facteurBase = 20 si l'unité de base est la Pièce). */
  facteurBase: number;
  prixVente: number;
  prixAchat: number;
  ordre?: number;
}

/** Corps envoyé à la création/modification d'une unité de vente. Le formulaire ne
 *  calcule jamais lui-même le facteur total : on envoie uniquement la référence choisie
 *  (uniteReferenceId omis = relatif à l'unité de base du produit) et le facteur relatif
 *  saisi par l'utilisateur ; le serveur calcule facteurBase tout seul. */
export interface UniteVenteRequest {
  nom: string;
  prixVente: number;
  prixAchat: number;
  ordre?: number;
  uniteReferenceId?: number;
  facteurRelatif: number;
}

@Injectable({ providedIn: 'root' })
export class UniteVenteService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders | null {
    const token = this.authService.getToken();
    if (!token) return null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /** Accessible ADMIN ou VENDEUR. Liste vide = ce produit ne se vend qu'à l'unité de base
   *  (comportement actuel inchangé). */
  getUnites(produitId: number): Observable<UniteVente[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Token non disponible'));
    return this.http.get<any>(`${this.apiUrl}/${produitId}/unites-vente`, { headers }).pipe(
      map(response => (response?.unites || []) as UniteVente[]),
      catchError(error => {
        console.error('Erreur lors du chargement des unités de vente:', error);
        return throwError(() => new Error('Impossible de charger les unités de vente'));
      })
    );
  }

  /** Réservé ADMIN — le serveur revérifie systématiquement le privilège. */
  createUnite(produitId: number, data: UniteVenteRequest): Observable<UniteVente> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Token non disponible'));
    return this.http.post<any>(`${this.apiUrl}/${produitId}/unites-vente`, data, { headers }).pipe(
      map(response => (response?.unite || response) as UniteVente),
      catchError(error => {
        console.error('Erreur lors de la création de l\'unité de vente:', error);
        return throwError(() => new Error(error?.error?.error || error?.error?.message || 'Impossible de créer cette unité de vente'));
      })
    );
  }

  /** Réservé ADMIN. */
  updateUnite(id: number, data: UniteVenteRequest): Observable<UniteVente> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Token non disponible'));
    return this.http.put<any>(`${this.apiUrl}/unites-vente/${id}`, data, { headers }).pipe(
      map(response => (response?.unite || response) as UniteVente),
      catchError(error => {
        console.error('Erreur lors de la modification de l\'unité de vente:', error);
        return throwError(() => new Error(error?.error?.error || error?.error?.message || 'Impossible de modifier cette unité de vente'));
      })
    );
  }

  /** Réservé ADMIN. */
  deleteUnite(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Token non disponible'));
    return this.http.delete<any>(`${this.apiUrl}/unites-vente/${id}`, { headers }).pipe(
      map(() => undefined),
      catchError(error => {
        console.error('Erreur lors de la suppression de l\'unité de vente:', error);
        return throwError(() => new Error(error?.error?.error || error?.error?.message || 'Impossible de supprimer cette unité de vente'));
      })
    );
  }
}
