import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const URL = `${environment.apiUrl}/transferts`;

export interface BoutiquePartenaire {
  id?: number;
  nom: string;
  url: string;
  description?: string;
  actif: boolean;
}

export interface LigneTransfert {
  id?: number;
  produitId: number;
  produitNom: string;
  quantite: number;
  prixUnitaire?: number;
  montantTotal?: number;
}

export interface HistoriqueTransfert {
  id?: number;
  action: string;
  description: string;
  effectuePar: string;
  dateAction: string;
}

export interface TransfertStock {
  id?: number;
  numeroTransfert?: string;
  boutiqueSourceNom: string;
  boutiqueDestNom: string;
  // Vide côté source (boutiqueSourceUrl) et côté destination (boutiqueDestUrl) —
  // c'est justement ce qui permet de savoir si CE transfert est un envoi ou une
  // réception : boutiqueDestUrl est rempli uniquement sur l'enregistrement créé
  // par creer() côté source (cf. accepterTransfert / bouton Confirmer vs Accepter).
  boutiqueSourceUrl?: string;
  boutiqueDestUrl?: string;
  statut: string;
  typePaiement: string;
  notes?: string;
  dateCreation?: string;
  dateConfirmation?: string;
  confirmeParUser?: string;
  creePar?: string;
  lignes: LigneTransfert[];
  historique?: HistoriqueTransfert[];
  motifRejet?: string;
}

export interface TransfertRequest {
  boutiqueDestId: number;
  typePaiement: string;
  notes?: string;
  lignes: { produitId: number; produitNom: string; quantite: number; prixUnitaire?: number }[];
}

export interface PaiementTransfert {
  id?: number;
  transfertId: number;
  montant: number;
  modePaiement: string; // ESPECES | ORANGE_MONEY | MOOV_MONEY | WAVE_MONEY | VIREMENT
  datePaiement?: string;
  notes?: string;
  enregistrePar?: string;
}

@Injectable({ providedIn: 'root' })
export class TransfertService {

  constructor(private http: HttpClient) {}

  // Partenaires
  getPartenaires(): Observable<BoutiquePartenaire[]> {
    return this.http.get<BoutiquePartenaire[]>(`${URL}/partenaires`);
  }
  ajouterPartenaire(p: BoutiquePartenaire): Observable<BoutiquePartenaire> {
    return this.http.post<BoutiquePartenaire>(`${URL}/partenaires`, p);
  }
  modifierPartenaire(id: number, p: BoutiquePartenaire): Observable<BoutiquePartenaire> {
    return this.http.put<BoutiquePartenaire>(`${URL}/partenaires/${id}`, p);
  }
  supprimerPartenaire(id: number): Observable<void> {
    return this.http.delete<void>(`${URL}/partenaires/${id}`);
  }

  // Transferts
  getTout(): Observable<TransfertStock[]> {
    return this.http.get<TransfertStock[]>(URL);
  }
  getById(id: number): Observable<TransfertStock> {
    return this.http.get<TransfertStock>(`${URL}/${id}`);
  }
  creer(req: TransfertRequest): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(URL, req);
  }
  modifier(id: number, req: TransfertRequest): Observable<TransfertStock> {
    return this.http.put<TransfertStock>(`${URL}/${id}`, req);
  }
  confirmer(id: number): Observable<TransfertStock> {
    return this.http.put<TransfertStock>(`${URL}/${id}/confirmer`, {});
  }
  annuler(id: number, motif?: string): Observable<TransfertStock> {
    return this.http.put<TransfertStock>(`${URL}/${id}/annuler`, { motif });
  }

  // Nouveaux endpoints
  getEnvoyes(): Observable<TransfertStock[]> {
    return this.http.get<TransfertStock[]>(`${URL}/envoyes`);
  }
  getRecus(): Observable<TransfertStock[]> {
    return this.http.get<TransfertStock[]>(`${URL}/recus`);
  }
  accepter(id: number): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${URL}/${id}/accepter`, {});
  }
  rejeter(id: number, motif?: string): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${URL}/${id}/rejeter`, { motif });
  }

  // Produits d'une boutique partenaire
  getProduitsBoutique(partenaireId: number): Observable<any[]> {
    return this.http.get<any>(`${URL}/partenaires/${partenaireId}/produits`).pipe(
      map((r: any) => Array.isArray(r) ? r : (r?.data || r?.produits || [])),
      catchError(() => of([]))
    );
  }

  // Paiements inter-boutiques
  getPaiementsTransfert(transfertId: number): Observable<PaiementTransfert[]> {
    return this.http.get<PaiementTransfert[]>(`${URL}/${transfertId}/paiements`).pipe(
      map((r: any) => Array.isArray(r) ? r : (r?.data || [])),
      catchError(() => of([]))
    );
  }

  ajouterPaiement(transfertId: number, paiement: { montant: number; modePaiement: string; notes?: string }): Observable<PaiementTransfert> {
    return this.http.post<PaiementTransfert>(`${URL}/${transfertId}/paiements`, paiement);
  }
}
