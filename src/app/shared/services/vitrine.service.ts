import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface VitrineProduitDto {
  id: number;
  nom: string;
  categorieNom: string;
  prixVente: number;
  /** Vente à la mesure : prix exprimé par cette unité (kg, L, m), sinon absent. */
  unite?: string | null;
  disponible: boolean;
  /** DISPONIBLE / STOCK_FAIBLE / RUPTURE */
  statutStock: 'DISPONIBLE' | 'STOCK_FAIBLE' | 'RUPTURE';
  enPromotion: boolean;
  promotionTitre: string | null;
  promotionReduction: string | null;
  /** Version de la photo (absente = pas de photo). */
  imageVersion?: number | null;
}

export interface VitrineInfoDto {
  nom: string;
  adresse: string;
  telephone: string;
  horairesOuverture: string | null;
  logoPath: string | null;
  /** false si le super admin a désactivé la vitrine (Boutique > Paramètres). */
  vitrineActive: boolean;
}

export interface VitrineCommandeLigne {
  produitId: number;
  quantite: number;
}

export interface VitrineCommandeRequest {
  clientNom: string;
  clientPrenom?: string;
  clientTelephone: string;
  notes?: string;
  adresseLivraison?: string;
  lignes: VitrineCommandeLigne[];
}

/** État d'une commande vue par le client (suivi sans compte : numéro + téléphone). */
export interface VitrineSuivi {
  numero: string;
  /** BROUILLON = reçue, en attente de la boutique. */
  statut: 'BROUILLON' | 'VALIDEE' | 'ANNULEE';
  /** Après confirmation : PRETE puis LIVREE. */
  etapeLivraison?: 'PRETE' | 'LIVREE' | null;
  dateCommande: string;
  montantTotal: number;
  lignes: { nom: string; quantite: number }[];
}

export interface VitrineCommandeReponse {
  success: boolean;
  numeroCommande?: string;
  /** Code secret remis au client : sans lui, la commande ne peut pas être suivie. */
  codeSuivi?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class VitrineService {

  private apiUrl = `${environment.apiUrl}/vitrine`;

  constructor(private http: HttpClient) {}

  getProduits(): Observable<VitrineProduitDto[]> {
    return this.http.get<VitrineProduitDto[]>(`${this.apiUrl}/produits`).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement des produits')))
    );
  }

  getInfos(): Observable<VitrineInfoDto> {
    return this.http.get<VitrineInfoDto>(`${this.apiUrl}/infos`).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Erreur chargement des informations')))
    );
  }

  suivreCommandes(commandes: { numero: string; code: string }[]): Observable<VitrineSuivi[]> {
    return this.http.post<VitrineSuivi[]>(`${this.apiUrl}/suivi`, { commandes }).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Impossible de charger vos commandes')))
    );
  }

  passerCommande(request: VitrineCommandeRequest): Observable<VitrineCommandeReponse> {
    return this.http.post<VitrineCommandeReponse>(`${this.apiUrl}/commande`, request).pipe(
      catchError(e => throwError(() => new Error(e?.error?.message || 'Impossible d\'envoyer la commande')))
    );
  }
}
