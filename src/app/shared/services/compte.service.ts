import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Compte {
  id: number;
  nomBanque: string;
  numeroCompte?: string;
  agence?: string;
  titulaire?: string;
  soldeInitial: number;
  totalVersements: number;
  totalRetraits: number;
  totalCheques: number;
  totalFrais: number;
  totalBonsCaisse: number;
  soldeActuel: number;
  actif: boolean;
  description?: string;
  dateCreation?: string;
}

export interface CompteRequest {
  nomBanque: string;
  numeroCompte?: string;
  agence?: string;
  titulaire?: string;
  soldeInitial: number;
  description?: string;
}

export type TypeOperationCompte =
  | 'VERSEMENT'
  | 'RETRAIT'
  | 'CHEQUE'
  | 'FRAIS'
  | 'BON_CAISSE'
  | 'PAIEMENT_FOURNISSEUR'
  | 'AVANCE_FOURNISSEUR';

export interface OperationCompteRequest {
  compteId: number;
  type: TypeOperationCompte;
  montant: number;
  motif?: string;
  reference?: string;
  utilisateurId?: number;
}

export interface OperationCompte {
  id: number;
  type: TypeOperationCompte;
  montant: number;
  soldeAvant: number;
  soldeApres: number;
  motif?: string;
  reference?: string;
  dateOperation: string;
}

// Interface pour le transfert Caisse → Banque
export interface TransfertCaisseBanqueRequest {
  compteId: number;
  montant: number;
  motif: string;
  utilisateurId?: number;
  reference?: string;
}

@Injectable({ providedIn: 'root' })
export class CompteService {

  private apiUrl = `${environment.apiUrl}/comptes`;

  constructor(private http: HttpClient) {}

  getTousLesComptes(): Observable<Compte[]> {
    return this.http.get<Compte[]>(this.apiUrl).pipe(
      catchError(e => throwError(() => new Error(e.error?.message || 'Erreur chargement comptes')))
    );
  }

  getCompteById(id: number): Observable<Compte> {
    return this.http.get<Compte>(`${this.apiUrl}/${id}`).pipe(
      catchError(e => throwError(() => new Error(e.error?.message || 'Erreur')))
    );
  }

  creerCompte(request: CompteRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      catchError(e => throwError(() => new Error(e.error?.message || 'Erreur création compte')))
    );
  }

  modifierCompte(id: number, request: CompteRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(e => throwError(() => new Error(e.error?.message || 'Erreur modification compte')))
    );
  }

  enregistrerOperation(request: OperationCompteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/operation`, request).pipe(
      catchError(e => throwError(() => new Error(e.error?.message || 'Erreur opération')))
    );
  }

  getHistoriqueOperations(compteId: number): Observable<OperationCompte[]> {
    return this.http.get<OperationCompte[]>(`${this.apiUrl}/${compteId}/operations`).pipe(
      catchError(e => throwError(() => new Error(e.error?.message || 'Erreur historique')))
    );
  }

  // NOUVELLE MÉTHODE: Transfert Caisse → Banque
  transfererCaisseVersBanque(request: TransfertCaisseBanqueRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/caisse/transferer-vers-banque`, request).pipe(
      catchError(e => throwError(() => new Error(e.error?.error || e.error?.message || 'Erreur transfert caisse → banque')))
    );
  }
}