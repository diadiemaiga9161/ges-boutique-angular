// src/app/shared/services/journal-audit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Liste FERMÉE et définitive des types d'action (enum backend TypeActionAudit).
// Ne pas en ajouter sans confirmation du backend.
export type TypeActionAudit =
  | 'SUPPRESSION_VENTE'
  | 'MODIFICATION_PRIX_PRODUIT'
  | 'ANNULATION_TRANSFERT'
  | 'SUPPRESSION_TRANSFERT'
  | 'SUPPRESSION_CLIENT'
  | 'SUPPRESSION_FOURNISSEUR'
  | 'MODIFICATION_ROLE_UTILISATEUR'
  | 'SUPPRESSION_CREDIT';

export interface JournalAuditEntry {
  id: number;
  utilisateurId: number;
  utilisateurNom: string;
  action: TypeActionAudit | string;
  details: string;
  dateAction: string;
}

export interface JournalAuditFiltre {
  page?: number;
  size?: number;
  dateDebut?: string;
  dateFin?: string;
  utilisateurId?: number;
}

export interface JournalAuditResponse {
  success: boolean;
  journaux: JournalAuditEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class JournalAuditService {
  private apiUrl = `${environment.apiUrl}/journal-audit`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    if (!token) {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
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
    } else if (error.status === 403) {
      message = 'Accès réservé aux administrateurs.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.error?.error) {
      message = error.error.error;
    } else if (typeof error.error === 'string') {
      message = error.error;
    }

    return throwError(() => new Error(message));
  }

  /**
   * GET /api/journal-audit — pagination et filtres gérés côté backend.
   * Tous les paramètres sont optionnels sauf la pagination.
   */
  getJournal(filtre: JournalAuditFiltre = {}): Observable<JournalAuditResponse> {
    let params = new HttpParams();
    if (filtre.page !== undefined && filtre.page !== null) {
      params = params.set('page', filtre.page.toString());
    }
    if (filtre.size !== undefined && filtre.size !== null) {
      params = params.set('size', filtre.size.toString());
    }
    if (filtre.dateDebut) {
      params = params.set('dateDebut', filtre.dateDebut);
    }
    if (filtre.dateFin) {
      params = params.set('dateFin', filtre.dateFin);
    }
    if (filtre.utilisateurId) {
      params = params.set('utilisateurId', filtre.utilisateurId.toString());
    }

    return this.http.get<JournalAuditResponse>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(error => this.handleError(error, 'récupérer le journal d\'audit'))
    );
  }
}
