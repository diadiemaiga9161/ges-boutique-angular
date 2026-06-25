import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Promotion {
  id?: number;
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  typeReduction: 'POURCENTAGE' | 'MONTANT_FIXE';
  valeurReduction: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WhatsAppLien {
  nom: string;
  telephone: string;
  url: string;
}

export interface WhatsAppResult {
  promotion: Promotion;
  message: string;
  liens: WhatsAppLien[];
  totalClients: number;
  clientsAvecTelephone: number;
  clientsSansTelephone: number;
}

@Injectable({ providedIn: 'root' })
export class PromotionService {

  private apiUrl = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<Promotion[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(r => r.promotions || []),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement promotions')))
    );
  }

  getActives(): Observable<Promotion[]> {
    return this.http.get<any>(`${this.apiUrl}/actives`, { headers: this.getHeaders() }).pipe(
      map(r => r.promotions || []),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement promotions actives')))
    );
  }

  creer(promo: Partial<Promotion>): Observable<Promotion> {
    return this.http.post<any>(this.apiUrl, promo, { headers: this.getHeaders() }).pipe(
      map(r => r.promotion || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur création promotion')))
    );
  }

  modifier(id: number, promo: Partial<Promotion>): Observable<Promotion> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, promo, { headers: this.getHeaders() }).pipe(
      map(r => r.promotion || r),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur modification promotion')))
    );
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(() => void 0),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur suppression promotion')))
    );
  }

  preparerWhatsApp(id: number): Observable<WhatsAppResult> {
    return this.http.get<any>(`${this.apiUrl}/${id}/whatsapp`, { headers: this.getHeaders() }).pipe(
      map(r => r as WhatsAppResult),
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur préparation WhatsApp')))
    );
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  isExpired(promo: Promotion): boolean {
    return new Date(promo.dateFin) < new Date();
  }

  isActive(promo: Promotion): boolean {
    const today = new Date();
    return promo.active && new Date(promo.dateDebut) <= today && new Date(promo.dateFin) >= today;
  }
}
