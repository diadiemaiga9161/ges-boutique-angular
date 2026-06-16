// src/app/shared/services/client.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Client {
  id?: number;
  nom: string;
  prenom: string;
  numeroTelephone?: string;
  telephone?: string;
  adresse?: string;
  email?: string;
  dateCreation?: string;
  ventes?: any[];
  soldeAvance?: number;
}

export interface AvanceClient {
  id?: number;
  clientNom: string;
  clientTelephone?: string;
  montant: number;
  montantUtilise: number;
  montantDisponible: number;
  dateDepot: string;
  motif?: string;
  statut: 'DISPONIBLE' | 'UTILISE_PARTIELLEMENT' | 'EPUISE';
}

export interface AvanceClientRequest {
  clientNom: string;
  clientTelephone?: string;
  montant: number;
  motif?: string;
  utilisateurId?: number;
  modePaiement?: string;
  referencePaiement?: string;
}

export interface HistoriqueAvanceResponse {
  clientNom: string;
  soldeDisponible: number;
  historique: AvanceClient[];
  totalDepose: number;
  totalUtilise: number;
}

export interface TopClient {
  client: Client;
  nombreAchats: number;
  montantTotal: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  client?: T;
  clients?: T[];
  topClients?: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token non disponible. Veuillez vous reconnecter.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

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

  private extractData<T>(response: any): T {
    if (!response) return {} as T;
    if (response.success === false) {
      throw new Error(response.message || 'Erreur inconnue');
    }
    if (response.client) return response.client as T;
    if (response.clients) return response.clients as T;
    if (response.data) return response.data as T;
    return response as T;
  }

  getAll(): Observable<Client[]> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Client[]>(response) || []),
      map(clients => (clients || []).map(client => this.normalizeClient(client))),
      catchError(error => this.handleError(error, 'récupérer les clients'))
    );
  }

  getById(id: number): Observable<Client> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Client>(response)),
      map(client => this.normalizeClient(client)),
      catchError(error => this.handleError(error, `récupérer le client ${id}`))
    );
  }

  getByTelephone(numeroTelephone: string): Observable<Client | null> {
    return this.http.get<any>(`${this.apiUrl}/telephone/${encodeURIComponent(numeroTelephone)}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response && response.success === false) {
          return null;
        }
        const client = this.extractData<Client>(response);
        return client ? this.normalizeClient(client) : null;
      }),
      catchError(() => {
        return [null];
      })
    );
  }

  search(query: string): Observable<Client[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<any>(`${this.apiUrl}/recherche`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => this.extractData<Client[]>(response) || []),
      map(clients => (clients || []).map(client => this.normalizeClient(client))),
      catchError(error => this.handleError(error, 'rechercher les clients'))
    );
  }

  create(client: Client): Observable<Client> {
    return this.http.post<any>(this.apiUrl, this.toBackendClient(client), {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Client>(response)),
      map(created => this.normalizeClient(created)),
      catchError(error => this.handleError(error, 'créer le client'))
    );
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, this.toBackendClient(client), {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Client>(response)),
      map(updated => this.normalizeClient(updated)),
      catchError(error => this.handleError(error, `modifier le client ${id}`))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, `supprimer le client ${id}`))
    );
  }

  getTopClients(): Observable<TopClient[]> {
    return this.http.get<any>(`${this.apiUrl}/top-clients`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const topClients = response?.topClients || response?.data || [];
        if (Array.isArray(topClients)) {
          return topClients.map((item: any) => ({
            ...item,
            client: this.normalizeClient(item.client)
          }));
        }
        return [];
      }),
      catchError(error => this.handleError(error, 'récupérer les meilleurs clients'))
    );
  }

  getFullName(client: Client): string {
    return [client.prenom, client.nom].filter(Boolean).join(' ').trim() || client.numeroTelephone || client.telephone || '';
  }

  private normalizeClient(client: Client): Client {
    if (!client) return { id: 0, nom: '', prenom: '' };
    return {
      ...client,
      telephone: client.telephone || client.numeroTelephone || '',
      numeroTelephone: client.numeroTelephone || client.telephone || '',
      adresse: client.adresse || '',
      email: client.email || ''
    };
  }

  private toBackendClient(client: Client): Client {
    return {
      ...client,
      numeroTelephone: client.numeroTelephone || client.telephone || ''
    };
  }

  // ==================== AVANCES CLIENT ====================

  enregistrerAvance(request: AvanceClientRequest): Observable<{ success: boolean; message: string; avance: AvanceClient }> {
    return this.http.post<any>(`${environment.apiUrl}/avances`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'enregistrer l\'avance'))
    );
  }

  getSoldeAvance(clientNom: string, clientTelephone?: string): Observable<{ clientNom: string; soldeDisponible: number }> {
    let params = new HttpParams().set('clientNom', clientNom);
    if (clientTelephone) params = params.set('clientTelephone', clientTelephone);
    return this.http.get<any>(`${environment.apiUrl}/avances/solde`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(error => this.handleError(error, 'récupérer le solde avance'))
    );
  }

  getHistoriqueAvances(clientNom: string, clientTelephone?: string): Observable<HistoriqueAvanceResponse> {
    let params = new HttpParams().set('clientNom', clientNom);
    if (clientTelephone) params = params.set('clientTelephone', clientTelephone);
    return this.http.get<any>(`${environment.apiUrl}/avances/historique`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(error => this.handleError(error, 'récupérer l\'historique des avances'))
    );
  }
}