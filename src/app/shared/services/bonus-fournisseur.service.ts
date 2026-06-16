import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type TypeBonus = 'RISTOURNE' | 'BONUS_VOLUME' | 'PRIME_OBJECTIF' | 'BONUS_ACHAT';

export interface BonusFournisseur {
  id?: number;
  fournisseurId: number;
  fournisseurNom?: string;
  type: TypeBonus;
  typeLibelle?: string;
  montant: number;
  produitId?: number;
  produitNom?: string;
  quantiteProduit?: number;
  date: string;
  description?: string;
  dateCreation?: string;
}

export interface BonusFournisseurRequest {
  fournisseurId: number;
  type: TypeBonus;
  montant: number;
  produitId?: number;
  quantiteProduit?: number;
  date: string;
  description?: string;
}

export interface BonusStats {
  mois: number;
  annee: number;
  totalMois: number;
  totalAnnee: number;
  nombreMois: number;
  lignes: BonusFournisseur[];
}

@Injectable({ providedIn: 'root' })
export class BonusFournisseurService {

  private apiUrl = `${environment.apiUrl}/bonus-fournisseurs`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getAll(): Observable<BonusFournisseur[]> {
    return this.http.get<BonusFournisseur[]>(this.apiUrl, { headers: this.headers() }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement bonus')))
    );
  }

  getParFournisseur(fournisseurId: number): Observable<BonusFournisseur[]> {
    return this.http.get<BonusFournisseur[]>(`${this.apiUrl}/fournisseur/${fournisseurId}`, { headers: this.headers() }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur')))
    );
  }

  getParPeriode(debut: string, fin: string): Observable<BonusFournisseur[]> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http.get<BonusFournisseur[]>(`${this.apiUrl}/periode`, { headers: this.headers(), params }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur')))
    );
  }

  getStatistiques(mois?: number, annee?: number): Observable<BonusStats> {
    let params = new HttpParams();
    if (mois) params = params.set('mois', mois.toString());
    if (annee) params = params.set('annee', annee.toString());
    return this.http.get<BonusStats>(`${this.apiUrl}/statistiques`, { headers: this.headers(), params }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur stats')))
    );
  }

  creer(request: BonusFournisseurRequest): Observable<BonusFournisseur> {
    return this.http.post<BonusFournisseur>(this.apiUrl, request, { headers: this.headers() }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur création bonus')))
    );
  }

  modifier(id: number, request: BonusFournisseurRequest): Observable<BonusFournisseur> {
    return this.http.put<BonusFournisseur>(`${this.apiUrl}/${id}`, request, { headers: this.headers() }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur modification bonus')))
    );
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers() }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur suppression bonus')))
    );
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  libelleType(type: TypeBonus): string {
    const map: Record<TypeBonus, string> = {
      RISTOURNE: 'Ristourne',
      BONUS_VOLUME: 'Bonus Volume',
      PRIME_OBJECTIF: 'Prime Objectif',
      BONUS_ACHAT: 'Bonus Achat'
    };
    return map[type] || type;
  }
}
