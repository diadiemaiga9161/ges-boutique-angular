import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ResultatNet {
  periode: string;
  dateDebut: string;
  dateFin: string;
  benefices: number;
  bonusFournisseurs: number;
  depenses: number;
  resultatNet: number;
  etat: 'GAIN' | 'PERTE';
}

@Injectable({ providedIn: 'root' })
export class ResultatNetService {

  private apiUrl = `${environment.apiUrl}/resultat-net`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getJournalier(date?: string): Observable<ResultatNet> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ResultatNet>(`${this.apiUrl}/journalier`, { headers: this.headers(), params }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur résultat journalier')))
    );
  }

  getMensuel(mois?: number, annee?: number): Observable<ResultatNet> {
    let params = new HttpParams();
    if (mois) params = params.set('mois', mois.toString());
    if (annee) params = params.set('annee', annee.toString());
    return this.http.get<ResultatNet>(`${this.apiUrl}/mensuel`, { headers: this.headers(), params }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur résultat mensuel')))
    );
  }

  getAnnuel(annee?: number): Observable<ResultatNet> {
    let params = new HttpParams();
    if (annee) params = params.set('annee', annee.toString());
    return this.http.get<ResultatNet>(`${this.apiUrl}/annuel`, { headers: this.headers(), params }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur résultat annuel')))
    );
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }
}
