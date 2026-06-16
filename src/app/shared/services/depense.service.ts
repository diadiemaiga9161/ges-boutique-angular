import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Depense {
  id?: number;
  nom: string;
  motif?: string;
  date: string;
  montant: number;
  operationCaisseId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepenseRequest {
  nom: string;
  motif?: string;
  date: string;
  montant: number;
}

@Injectable({ providedIn: 'root' })
export class DepenseService {

  private apiUrl = `${environment.apiUrl}/depenses`;

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

  supprimer(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(() => void 0),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur suppression dépense')))
    );
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }
}
