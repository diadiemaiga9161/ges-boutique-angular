// src/app/shared/services/parametres.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface ParametresSelection {
  soldeCaisse: boolean;
  historiqueOperationsCaisse: boolean;
  creditsRegles: boolean;
  historiqueVentesAnnulees: boolean;
}

export interface ParametresStatut {
  soldeCaisse: number;
  nombreOperationsCaisse: number;
  nombreCreditsRegles: number;
  nombreVentesAnnulees: number;
}

@Injectable({ providedIn: 'root' })
export class ParametresService {

  private apiUrl = `${environment.apiUrl}/parametres`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getStatut(): Observable<ParametresStatut> {
    return this.http.get<ParametresStatut>(`${this.apiUrl}/statut`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(err => {
        console.error('Erreur getStatut parametres:', err);
        return throwError(() => err);
      })
    );
  }

  reinitialiser(selection: ParametresSelection): Observable<any> {
    return this.http.post(`${this.apiUrl}/reinitialiser`, selection, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(err => {
        console.error('Erreur reinitialiser parametres:', err);
        return throwError(() => err);
      })
    );
  }

  supprimer(selection: ParametresSelection): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimer`, {
      headers: this.authService.getAuthHeaders(),
      body: selection
    }).pipe(
      catchError(err => {
        console.error('Erreur supprimer parametres:', err);
        return throwError(() => err);
      })
    );
  }
}
