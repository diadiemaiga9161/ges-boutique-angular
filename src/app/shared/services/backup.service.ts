// src/app/shared/services/backup.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface BackupInfo {
  nomFichier: string;
  dateCreation: string;
  tailleOctets: number;
}

export interface BackupListeResponse {
  success: boolean;
  sauvegardes: BackupInfo[];
  nombre: number;
}

export interface BackupDeclencherResponse {
  success: boolean;
  message: string;
  nomFichier?: string;
  tailleOctets?: number;
  dateCreation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private apiUrl = `${environment.apiUrl}/backup`;

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
    } else if (error.status === 404) {
      message = 'Ce fichier de sauvegarde est introuvable (il a peut-être été supprimé par la rotation automatique).';
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
   * GET /api/backup/liste — liste des sauvegardes disponibles, triée du plus
   * récent au plus ancien (tri assuré côté backend).
   */
  getListe(): Observable<BackupListeResponse> {
    return this.http.get<BackupListeResponse>(`${this.apiUrl}/liste`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'récupérer la liste des sauvegardes'))
    );
  }

  /**
   * POST /api/backup/declencher — lance un mysqldump synchrone côté serveur.
   * Peut prendre plusieurs secondes : à l'appelant de bloquer le bouton
   * pendant l'appel (spinner).
   */
  declencher(): Observable<BackupDeclencherResponse> {
    return this.http.post<BackupDeclencherResponse>(`${this.apiUrl}/declencher`, null, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'déclencher la sauvegarde'))
    );
  }

  /**
   * GET /api/backup/telecharger/{nomFichier} — endpoint protégé (pas public),
   * on récupère le blob authentifié puis on déclenche le téléchargement
   * navigateur nous-mêmes (même pattern que product.service.ts / caisse.service.ts).
   */
  telecharger(nomFichier: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/telecharger/${encodeURIComponent(nomFichier)}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomFichier;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'télécharger la sauvegarde'))
    );
  }
}
