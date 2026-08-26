import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface TypeDepense {
  id: number;
  nom: string;
}

export interface Depense {
  id?: number;
  nom: string;
  motif?: string;
  date: string;
  montant: number;
  typeDepense?: string;
  operationCaisseId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Traçabilité comptable
  validee?: boolean;
  valideParId?: number;
  valideLe?: string;
  annulee?: boolean;
  motifAnnulation?: string;
  annuleParId?: number;
  dateAnnulation?: string;
}

export interface DepenseRequest {
  nom: string;
  motif?: string;
  date: string;
  montant: number;
  typeDepense?: string;
}

@Injectable({ providedIn: 'root' })
export class DepenseService {

  private apiUrl = `${environment.apiUrl}/depenses`;
  private typesUrl = `${environment.apiUrl}/types-depense`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<{ depenses: Depense[]; total: number }> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(r => ({ depenses: r.depenses || [], total: r.total || 0 })),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement dépenses')))
    );
  }

  getById(id: number): Observable<Depense> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(r => r.depense || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Dépense introuvable')))
    );
  }

  getParPeriode(debut: string, fin: string): Observable<{ depenses: Depense[]; total: number }> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http.get<any>(`${this.apiUrl}/periode`, { headers: this.getHeaders(), params }).pipe(
      map(r => ({ depenses: r.depenses || [], total: r.total || 0 })),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur filtre période')))
    );
  }

  creer(request: DepenseRequest): Observable<Depense> {
    return this.http.post<any>(this.apiUrl, request, { headers: this.getHeaders() }).pipe(
      map(r => r.depense || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur création dépense')))
    );
  }

  modifier(id: number, request: DepenseRequest): Observable<Depense> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request, { headers: this.getHeaders() }).pipe(
      map(r => r.depense || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur modification dépense')))
    );
  }

  supprimer(id: number, motif?: string): Observable<void> {
    let params = new HttpParams();
    if (motif) params = params.set('motif', motif);
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders(), params }).pipe(
      map(() => void 0),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur suppression dépense')))
    );
  }

  valider(id: number): Observable<Depense> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/valider`, {}, { headers: this.getHeaders() }).pipe(
      map(r => r.depense || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur validation dépense')))
    );
  }

  getTypes(): Observable<TypeDepense[]> {
    return this.http.get<any>(this.typesUrl, { headers: this.getHeaders() }).pipe(
      map(r => Array.isArray(r) ? r : (r.types || [])),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement types')))
    );
  }

  creerType(nom: string): Observable<TypeDepense> {
    return this.http.post<any>(this.typesUrl, { nom }, { headers: this.getHeaders() }).pipe(
      map(r => r.type || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur création type')))
    );
  }

  modifierType(id: number, nom: string): Observable<TypeDepense> {
    return this.http.put<any>(`${this.typesUrl}/${id}`, { nom }, { headers: this.getHeaders() }).pipe(
      map(r => r.type || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur modification type')))
    );
  }

  supprimerType(id: number): Observable<void> {
    return this.http.delete<any>(`${this.typesUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(() => void 0),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur suppression type')))
    );
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';
  }
}
