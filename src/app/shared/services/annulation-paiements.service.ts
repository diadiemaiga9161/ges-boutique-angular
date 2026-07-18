import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnnulationPaiementsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPaiementsFournisseur(dateDebut?: string, dateFin?: string): Observable<any[]> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin)   params = params.set('dateFin', dateFin);
    return this.http.get<any[]>(`${this.apiUrl}/fournisseur-achats/paiements`, { params });
  }

  annulerPaiementFournisseur(paiementId: number, utilisateurId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/fournisseur-achats/paiement/${paiementId}/annuler`,
      null,
      { params: new HttpParams().set('utilisateurId', utilisateurId.toString()) }
    );
  }

  getReglements(dateDebut?: string, dateFin?: string): Observable<any[]> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin)   params = params.set('dateFin', dateFin);
    return this.http.get<any[]>(`${this.apiUrl}/caisse/credits/reglements`, { params });
  }

  annulerReglementCredit(operationId: number, utilisateurId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/caisse/credits/reglement/${operationId}/annuler`,
      null,
      { params: new HttpParams().set('utilisateurId', utilisateurId.toString()) }
    );
  }
}
