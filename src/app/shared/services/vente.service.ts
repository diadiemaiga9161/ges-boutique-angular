// src/app/shared/services/vente.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BoutiqueService } from './boutique.service';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from './auth.service';

// =====================================================
// ENUMS
// =====================================================

export enum ModePaiement {
  ESPECES = 'ESPECES',
  ORANGE_MONEY = 'ORANGE_MONEY',
  MOOV_MONEY = 'MOOV_MONEY',
  WAVE_MONEY = 'WAVE_MONEY',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
  VIREMENT = 'VIREMENT'
}

export enum RemiseType {
  POURCENTAGE = 'POURCENTAGE',
  MONTANT_FIXE = 'MONTANT_FIXE'
}

// =====================================================
// INTERFACES CLIENT
// =====================================================

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  numeroTelephone: string;
  adresse?: string;
  email?: string;
  dateCreation: string;
}

// =====================================================
// INTERFACES VENTE
// =====================================================

export interface LigneVenteRequest {
  produitId: number;
  quantite: number;
  prixUnitaire?: number | null;
  remisePourcentage?: number | null;
  remiseMontant?: number | null;
}

export interface VenteRequest {
  vendeurId: number;
  lignes: LigneVenteRequest[];
  modePaiement: ModePaiement;
  referencePaiement?: string;
  remiseGlobale?: number;
  typeRemiseGlobale?: RemiseType;
  estCredit?: boolean;
  clientId?: number;
  clientDivers?: boolean;
  creerClient?: boolean;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  dateEcheance?: string;
  montantVerse?: number;
}

export interface VenteCreditRequest extends VenteRequest {
  clientNom: string;
  clientPrenom?: string;
  clientTelephone?: string;
  dateEcheance: string;
  montantVerse?: number;
  montantAvanceUtilise?: number;
}

export interface ReglementCreditRequest {
  venteId: number;
  montantRegle: number;
  utilisateurId: number;
  modePaiement: string;
  referencePaiement?: string;
  dateReglement?: string;
}

export interface LigneVenteDto {
  produitId: number;
  produitNom: string;
  quantite: number;
  prixUnitaire: number;
  prixAchat?: number;
  benefice?: number;
  remisePourcentage: number;
  remiseMontant: number;
  prixApresRemise: number;
  sousTotal: number;
  montantRemise: number;
}

export interface VenteDto {
  id: number;
  numeroVente: string;
  vendeurId: number;
  vendeurNom: string;
  clientId?: number;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  clientDivers?: boolean;
  lignes: LigneVenteDto[];
  montantTotal: number;
  montantRemiseTotal: number;
  montantApresRemise: number;
  remiseGlobale: number;
  typeRemiseGlobale: RemiseType;
  modePaiement: ModePaiement;
  referencePaiement: string;
  dateVente: string;
  estCredit: boolean;
  dateEcheance?: string;
  montantVerse?: number;
  montantRestant?: number;
  dateReglement?: string;
  creditRegle?: boolean;
  beneficeTotal?: number;
  annulee?: boolean;
  motifAnnulation?: string;
  dateAnnulation?: string;
}

export interface VenteMap {
  id: number;
  numeroVente: string;
  vendeurId: number;
  vendeurNom: string;
  montantTotal: number;
  montantRemiseTotal: number;
  montantApresRemise: number;
  remiseGlobale: number;
  typeRemiseGlobale: string;
  modePaiement: string;
  referencePaiement: string;
  dateVente: string;
  nombreProduits: number;
  lignes?: LigneVenteDto[];
  produits: LigneVenteDto[];
  estCredit: boolean;
  clientId?: number;
  clientDivers?: boolean;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  dateEcheance?: string;
  montantVerse?: number;
  montantRestant?: number;
  dateReglement?: string;
  creditRegle?: boolean;
  beneficeTotal?: number;
  annulee?: boolean;
  motifAnnulation?: string;
  dateAnnulation?: string;
  estRetourne?: boolean;
}

export interface VentesDuJourResponse {
  ventes: VenteMap[];
  totalVentes: number;
  montantTotal: number;
  montantTotalComptant: number;
  montantTotalCredit: number;
}

export interface VentesParTypeResponse {
  toutes: VenteMap[];
  comptant: VenteMap[];
  credit: VenteMap[];
}

export interface CreditsNonReglesResponse {
  credits: VenteMap[];
  nombreCredits: number;
  montantTotal: number;
}

export interface CreditsEnRetardResponse {
  credits: VenteMap[];
  nombreCredits: number;
  montantTotal: number;
}

export interface Statistiques {
  chiffreAffaireJournalier: number;
  chiffreAffaireHebdomadaire: number;
  chiffreAffaireMensuel: number;
  totalVentes: number;
  panierMoyen: number;
  totalRemises: number;
  chiffreAffaireParModePaiement: { [key: string]: number };
  totalCreditsNonRegles?: number;
  reglementsDuJour?: number;
}

export interface StatistiquesCredits {
  nombreCreditsNonRegles: number;
  montantTotalCreditsNonRegles: number;
  nombreCreditsEnRetard: number;
  montantTotalCreditsEnRetard: number;
}

export interface CreditInfo {
  id: number;
  numeroVente: string;
  clientNom: string;
  clientTelephone?: string;
  montantTotal: number;
  montantRestant: number;
  montantVerse: number;
  dateEcheance: string;
  enRetard: boolean;
  joursRetard: number;
  progression: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// =====================================================
// INTERFACES POUR EXPORTS PDF
// =====================================================

export interface ExportFilter {
  type: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM' | 'CREDIT' | 'CLIENT' | 'CLIENT_DIVERS';
  dateDebut?: string;
  dateFin?: string;
  clientId?: number;
  clientNom?: string;
}

export interface ExportStats {
  caTotal: number;
  caToday: number;
  beneficeTotal: number;
  beneficeToday: number;
  margeMoyenne: number;
  margeToday: number;
  nombreVentes: number;
  nombreVentesComptant: number;
  nombreVentesCredit: number;
  montantTotalComptant: number;
  montantTotalCredit: number;
  montantCreditsEnCours: number;
}

// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class VenteService {
  private apiUrl = `${environment.apiUrl}/ventes`;
  private clientApiUrl = `${environment.apiUrl}/clients`;

  private readonly BOUTIQUE_NOM = 'Boutique Alimentation Ndjim Et Frères';
  private readonly BOUTIQUE_TELEPHONE = '76 96 21 20/66 43 66 03';
  private readonly BOUTIQUE_EMAIL = 'ndjim@yahoo.fr';
  private readonly BOUTIQUE_ADRESSE = 'Misa bougou';
  private get LOGO_PATH(): string { return this.boutiqueService.getLogoPath(); }

  getModePaiementPlaceholder: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private boutiqueService: BoutiqueService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token non disponible');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any, context: string): Observable<never> {
    console.error(`Erreur lors de ${context}:`, error);
    let errorMessage = `Impossible de ${context}`;
    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || error.error?.error || 'Données invalides';
    } else if (error.status === 401) {
      errorMessage = 'Session expirée';
      setTimeout(() => this.authService.signout(), 2000);
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée';
    } else if (error.status === 409) {
      errorMessage = error.error?.message || 'Stock insuffisant';
    } else if (error.status === 500) {
      errorMessage = error.error?.message || 'Erreur serveur';
    }
    return throwError(() => new Error(errorMessage));
  }

  private unwrapVenteResponse(response: any): any {
    let data = response;

    for (let i = 0; i < 5; i++) {
      if (!data || Array.isArray(data)) return data;

      const next =
        data.vente ??
        data.venteDto ??
        data.venteResponse ??
        data.credit ??
        data.creditDto ??
        data.data?.vente ??
        data.data?.credit ??
        data.data ??
        data.result ??
        data.payload;

      if (!next || next === data) return data;
      data = next;
    }

    return data;
  }

  private getFirstArray(...candidates: any[]): any[] {
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
    return [];
  }

  private toNumber(value: any, fallback: number = 0): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  private mapVenteResponse(response: any): VenteMap {
    if (!response) return this.getEmptyVenteMap();

    const data = this.unwrapVenteResponse(response);
    const produits = this.mapLignesVente(data);
    return {
      id: data.id || 0,
      numeroVente: data.numeroVente || '',
      vendeurId: data.vendeurId || 0,
      vendeurNom: data.vendeurNom || 'Inconnu',
      montantTotal: data.montantTotal || 0,
      montantRemiseTotal: data.montantRemiseTotal || 0,
      montantApresRemise: data.montantApresRemise || data.montantTotal || 0,
      remiseGlobale: data.remiseGlobale || 0,
      typeRemiseGlobale: data.typeRemiseGlobale || '',
      modePaiement: data.modePaiement || '',
      referencePaiement: data.referencePaiement || '',
      dateVente: data.dateVente || new Date().toISOString(),
      nombreProduits: produits.length,
      lignes: produits,
      produits,
      estCredit: data.estCredit || false,
      clientId: data.clientId,
      clientDivers: data.clientDivers,
      clientNom: data.clientNom || '',
      clientPrenom: data.clientPrenom || '',
      clientTelephone: data.clientTelephone || '',
      dateEcheance: data.dateEcheance || '',
      montantVerse: data.montantVerse ?? 0,
      montantRestant: data.montantRestant ?? (data.estCredit ? data.montantTotal : 0),
      dateReglement: data.dateReglement || '',
      creditRegle: data.creditRegle || false,
      beneficeTotal: data.beneficeTotal || 0,
      annulee: data.annulee || false,
      motifAnnulation: data.motifAnnulation,
      dateAnnulation: data.dateAnnulation,
      estRetourne: data.estRetourne || false
    };
  }

  private mapLignesVente(data: any): LigneVenteDto[] {
    const lignes = this.getFirstArray(
      data?.lignes,
      data?.ligneVentes,
      data?.lignesVente,
      data?.venteLignes,
      data?.details,
      data?.items,
      data?.articles,
      data?.produits,
      data?.products
    );
    if (!Array.isArray(lignes)) return [];

    return lignes.map((ligne: any) => {
      const produit = ligne.produit || ligne.product || ligne.article || ligne.produitDto || {};
      const produitId = this.toNumber(
        ligne.produitId ??
        ligne.idProduit ??
        ligne.productId ??
        ligne.articleId ??
        produit.id ??
        produit.produitId,
        0
      );
      const quantite = this.toNumber(ligne.quantite ?? ligne.qte ?? ligne.quantity ?? ligne.nombre, 0);
      const prixUnitaire = this.toNumber(
        ligne.prixUnitaire ??
        ligne.prixVente ??
        ligne.prix ??
        ligne.pu ??
        produit.prixVente ??
        produit.prix,
        0
      );
      const remisePourcentage = this.toNumber(ligne.remisePourcentage ?? ligne.tauxRemise ?? 0);
      const remiseMontant = this.toNumber(ligne.remiseMontant ?? ligne.montantRemiseLigne ?? 0);
      const prixApresRemise = Number(
        ligne.prixApresRemise ??
        ligne.prixVenteApresRemise ??
        this.calculerPrixApresRemise(prixUnitaire, remisePourcentage, remiseMontant)
      );
      const sousTotal = Number(ligne.sousTotal ?? ligne.total ?? ligne.montant ?? (prixApresRemise * quantite));

      return {
        produitId,
        produitNom: ligne.produitNom || ligne.nomProduit || ligne.designation || produit.nom || produit.libelle || ligne.nom || 'Produit',
        quantite,
        prixUnitaire,
        prixAchat: this.toNumber(ligne.prixAchat ?? produit.prixAchat ?? 0),
        benefice: this.toNumber(ligne.benefice ?? 0),
        remisePourcentage,
        remiseMontant,
        prixApresRemise,
        sousTotal,
        montantRemise: Number(ligne.montantRemise ?? this.calculerMontantRemise(prixUnitaire, quantite, remisePourcentage, remiseMontant))
      };
    });
  }

  private mapVenteListResponse(response: any, primaryKey: 'ventes' | 'credits' = 'ventes'): VenteMap[] {
    const ventes = response?.[primaryKey] || response?.data || response;
    if (Array.isArray(ventes)) {
      return ventes.map((vente: any) => this.mapVenteResponse(vente));
    }
    return [];
  }

  private buildVentesParType(ventes: VenteMap[]): VentesParTypeResponse {
    const toutes = ventes || [];
    return {
      toutes,
      comptant: toutes.filter(vente => !vente.estCredit),
      credit: toutes.filter(vente => vente.estCredit)
    };
  }

  private getEmptyVenteMap(): VenteMap {
    return {
      id: 0,
      numeroVente: '',
      vendeurId: 0,
      vendeurNom: '',
      montantTotal: 0,
      montantRemiseTotal: 0,
      montantApresRemise: 0,
      remiseGlobale: 0,
      typeRemiseGlobale: '',
      modePaiement: '',
      referencePaiement: '',
      dateVente: new Date().toISOString(),
      nombreProduits: 0,
      lignes: [],
      produits: [],
      estCredit: false,
      clientNom: '',
      clientPrenom: '',
      clientTelephone: '',
      dateEcheance: '',
      montantVerse: 0,
      montantRestant: 0,
      dateReglement: '',
      creditRegle: false,
      beneficeTotal: 0,
      annulee: false
    };
  }

  // ==================== CLIENTS ====================

  getClients(): Observable<Client[]> {
    return this.http.get<any>(this.clientApiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.clients || response.data || []),
      catchError(error => this.handleError(error, 'récupérer les clients'))
    );
  }

  searchClients(query: string): Observable<Client[]> {
    return this.http.get<any>(`${this.clientApiUrl}/recherche?query=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.clients || response.data || []),
      catchError(error => this.handleError(error, 'rechercher les clients'))
    );
  }

  getClientByTelephone(telephone: string): Observable<Client | null> {
    return this.http.get<any>(`${this.clientApiUrl}/telephone/${encodeURIComponent(telephone)}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.client || response.data || null),
      catchError(() => [null])
    );
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<any>(this.clientApiUrl, client, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.client || response.data),
      catchError(error => this.handleError(error, 'créer le client'))
    );
  }

  // ==================== VENTES ====================

  createVente(venteData: VenteRequest): Observable<VenteMap> {
    if (!venteData.vendeurId || venteData.vendeurId <= 0) {
      return throwError(() => new Error('ID vendeur invalide'));
    }
    if (!venteData.lignes || venteData.lignes.length === 0) {
      return throwError(() => new Error('La vente doit contenir au moins un produit'));
    }
    if (!venteData.modePaiement) {
      return throwError(() => new Error('Veuillez sélectionner un mode de paiement'));
    }
    if (!venteData.estCredit && venteData.modePaiement !== ModePaiement.ESPECES &&
        (!venteData.referencePaiement || venteData.referencePaiement.trim() === '')) {
      return throwError(() => new Error(`La référence est requise pour ${venteData.modePaiement}`));
    }

    const requestBody = {
      ...venteData,
      lignes: venteData.lignes.map(ligne => ({
        produitId: ligne.produitId,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire || null,
        remisePourcentage: ligne.remisePourcentage || null,
        remiseMontant: ligne.remiseMontant || null
      }))
    };

    return this.http.post<any>(this.apiUrl, requestBody, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, 'créer la vente'))
    );
  }

  createVenteCredit(creditData: VenteCreditRequest): Observable<VenteMap> {
    if (!creditData.clientNom || creditData.clientNom.trim() === '') {
      return throwError(() => new Error('Le nom du client est requis'));
    }
    if (!creditData.dateEcheance) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      creditData.dateEcheance = date.toISOString().split('T')[0];
    }

    const requestBody = {
      ...creditData,
      estCredit: true,
      lignes: creditData.lignes.map(ligne => ({
        produitId: ligne.produitId,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire || null,
        remisePourcentage: ligne.remisePourcentage || null,
        remiseMontant: ligne.remiseMontant || null
      }))
    };

    return this.http.post<any>(`${this.apiUrl}/credit`, requestBody, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, 'créer le crédit'))
    );
  }

  modifierVente(venteId: number, venteData: VenteRequest): Observable<VenteMap> {
    const requestBody = {
      ...venteData,
      lignes: venteData.lignes.map(ligne => ({
        produitId: ligne.produitId,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire || null,
        remisePourcentage: ligne.remisePourcentage || null,
        remiseMontant: ligne.remiseMontant || null
      }))
    };

    return this.http.put<any>(`${this.apiUrl}/${venteId}`, requestBody, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, 'modifier la vente'))
    );
  }

  modifierVenteCredit(venteId: number, creditData: VenteCreditRequest): Observable<VenteMap> {
    const requestBody = {
      ...creditData,
      estCredit: true,
      lignes: creditData.lignes.map(ligne => ({
        produitId: ligne.produitId,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire || null,
        remisePourcentage: ligne.remisePourcentage || null,
        remiseMontant: ligne.remiseMontant || null
      }))
    };

    return this.http.put<any>(`${this.apiUrl}/credits/${venteId}`, requestBody, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, 'modifier le crédit'))
    );
  }

  getVenteById(id: number): Observable<VenteMap> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, `récupérer la vente ${id}`))
    );
  }

  getVentePourModification(id: number, estCredit: boolean): Observable<VenteMap> {
    if (!estCredit) {
      return this.getVenteById(id);
    }

    return this.getVenteCreditById(id).pipe(
      catchError(() => this.getVenteById(id))
    );
  }

  getAllVentes(): Observable<VenteMap[]> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const ventes = response.ventes || response.data || response;
        if (Array.isArray(ventes)) {
          return ventes.map(v => this.mapVenteResponse(v));
        }
        return [];
      }),
      catchError(error => this.handleError(error, 'récupérer les ventes'))
    );
  }

  getVentesComptant(): Observable<VenteMap[]> {
    return this.getAllVentes().pipe(
      map(ventes => ventes.filter(vente => !vente.estCredit))
    );
  }

  getVentesCredit(): Observable<VenteMap[]> {
    return this.getAllVentes().pipe(
      map(ventes => ventes.filter(vente => vente.estCredit))
    );
  }

  getVentesParType(): Observable<VentesParTypeResponse> {
    return this.getAllVentes().pipe(
      map(ventes => this.buildVentesParType(ventes))
    );
  }

  getVentesDuJour(): Observable<VentesDuJourResponse> {
    return this.http.get<any>(`${this.apiUrl}/aujourdhui`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const ventes = (response.ventes || response.data || []).map((v: any) => this.mapVenteResponse(v));
        const montantTotal = response.montantTotal ?? ventes.reduce((sum: number, vente: VenteMap) => sum + vente.montantTotal, 0);
        const montantTotalComptant = response.montantTotalComptant ?? ventes
          .filter((vente: VenteMap) => !vente.estCredit)
          .reduce((sum: number, vente: VenteMap) => sum + vente.montantTotal, 0);
        const montantTotalCredit = response.montantTotalCredit ?? ventes
          .filter((vente: VenteMap) => vente.estCredit)
          .reduce((sum: number, vente: VenteMap) => sum + vente.montantTotal, 0);

        return {
          ventes,
          totalVentes: response.nombreVentes || ventes.length,
          montantTotal,
          montantTotalComptant,
          montantTotalCredit
        };
      }),
      catchError(error => this.handleError(error, 'récupérer les ventes du jour'))
    );
  }

  getVentesParPeriode(dateDebut: string, dateFin: string): Observable<VenteMap[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<any>(`${this.apiUrl}/periode`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => {
        const ventes = response.ventes || response.data || response;
        if (Array.isArray(ventes)) {
          return ventes.map(v => this.mapVenteResponse(v));
        }
        return [];
      }),
      catchError(error => this.handleError(error, 'récupérer les ventes par période'))
    );
  }

  getVentesParVendeur(vendeurId: number): Observable<VenteMap[]> {
    return this.http.get<any>(`${this.apiUrl}/vendeur/${vendeurId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const ventes = response.ventes || response.data || response;
        if (Array.isArray(ventes)) {
          return ventes.map(v => this.mapVenteResponse(v));
        }
        return [];
      }),
      catchError(error => this.handleError(error, 'récupérer les ventes par vendeur'))
    );
  }

  // ==================== CRÉDITS ====================

  getAllCredits(): Observable<VenteMap[]> {
    return this.http.get<any>(`${this.apiUrl}/credits`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const credits = response.credits || response.data || response;
        if (Array.isArray(credits)) {
          return credits.map(c => this.mapVenteResponse(c));
        }
        return [];
      }),
      catchError(error => this.handleError(error, 'récupérer les crédits'))
    );
  }

  getCreditsNonRegles(): Observable<CreditsNonReglesResponse> {
    return this.http.get<any>(`${this.apiUrl}/credits/non-regles`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => ({
        credits: (response.credits || []).map((c: any) => this.mapVenteResponse(c)),
        nombreCredits: response.nombreCredits || 0,
        montantTotal: response.montantTotal || 0
      })),
      catchError(error => this.handleError(error, 'récupérer les crédits non réglés'))
    );
  }

  getCreditsEnRetard(): Observable<CreditsEnRetardResponse> {
    return this.http.get<any>(`${this.apiUrl}/credits/en-retard`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => ({
        credits: (response.credits || []).map((c: any) => this.mapVenteResponse(c)),
        nombreCredits: response.nombreCredits || 0,
        montantTotal: response.montantTotal || 0
      })),
      catchError(error => this.handleError(error, 'récupérer les crédits en retard'))
    );
  }

  enregistrerReglementCredit(reglementData: ReglementCreditRequest): Observable<VenteMap> {
    if (!reglementData.venteId) {
      return throwError(() => new Error('ID vente requis'));
    }
    if (!reglementData.montantRegle || reglementData.montantRegle <= 0) {
      return throwError(() => new Error('Montant valide requis'));
    }
    if (!reglementData.modePaiement) {
      return throwError(() => new Error('Mode de paiement requis'));
    }
    if (reglementData.modePaiement !== 'ESPECES' && !reglementData.referencePaiement) {
      return throwError(() => new Error(`Référence requise pour ${reglementData.modePaiement}`));
    }

    return this.http.post<any>(`${this.apiUrl}/credits/${reglementData.venteId}/reglement`, reglementData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, 'enregistrer le règlement'))
    );
  }

  getStatistiquesCredits(): Observable<StatistiquesCredits> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/credits`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.statistiques || response),
      catchError(error => this.handleError(error, 'récupérer les statistiques crédits'))
    );
  }

  // ==================== REMISES ====================

  appliquerRemiseGlobale(venteId: number, remise: number, type: RemiseType): Observable<VenteMap> {
    const params = new HttpParams()
      .set('remise', remise.toString())
      .set('type', type);
    return this.http.post<any>(`${this.apiUrl}/${venteId}/remise-globale`, null, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, 'appliquer la remise globale'))
    );
  }

  annulerRemiseGlobale(venteId: number): Observable<VenteMap> {
    return this.http.delete<any>(`${this.apiUrl}/${venteId}/remise-globale`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, 'annuler la remise globale'))
    );
  }

  // ==================== STATISTIQUES ====================

  getStatistiquesChiffreAffaire(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.apiUrl}/statistiques/chiffre-affaire`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'récupérer les statistiques'))
    );
  }

  // ==================== MODIFICATION LIGNES ====================

  modifierLignesVente(venteId: number, lignes: LigneVenteRequest[], motif?: string): Observable<{
    success: boolean;
    ancienTotal: number;
    nouveauTotal: number;
    difference: number;
    numeroVente: string;
    message: string;
  }> {
    const user = this.authService.getUser();
    const body = {
      lignes,
      utilisateurId: user?.id,
      motif: motif || ''
    };
    return this.http.put<any>(`${this.apiUrl}/${venteId}/modifier-lignes`, body, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'modifier les lignes de la vente'))
    );
  }

  // ==================== ANNULATION ====================

  annulerVente(venteId: number, motif?: string): Observable<VenteMap> {
    const user = this.authService.getUser();
    let params = new HttpParams();
    if (user?.id) params = params.set('utilisateurId', user.id.toString());
    if (motif) params = params.set('motif', motif);
    
    params = params.set('repercuterCaisse', 'true');
    
    return this.http.post<any>(`${this.apiUrl}/${venteId}/annuler`, null, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => {
        const venteAnnulee = this.mapVenteResponse(response);
        venteAnnulee.annulee = true;
        return venteAnnulee;
      }),
      catchError(error => this.handleError(error, 'annuler la vente'))
    );
  }

  annulerVenteCredit(venteId: number, motif?: string): Observable<VenteMap> {
    const user = this.authService.getUser();
    let params = new HttpParams();
    if (user?.id) params = params.set('utilisateurId', user.id.toString());
    if (motif) params = params.set('motif', motif);
    
    params = params.set('repercuterCaisse', 'true');
    
    return this.http.post<any>(`${this.apiUrl}/credits/${venteId}/annuler`, null, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => {
        const venteAnnulee = this.mapVenteResponse(response);
        venteAnnulee.annulee = true;
        return venteAnnulee;
      }),
      catchError(error => this.handleError(error, 'annuler le crédit'))
    );
  }

  // ==================== FACTURES AVEC LOGO ====================

  telechargerFacture(venteId: number): Observable<any> {
    return this.getVenteById(venteId).pipe(
      map(vente => {
        this.genererFacturePDF(vente);
        return { success: true, message: 'Facture générée', venteId, numeroVente: vente.numeroVente };
      }),
      catchError(error => this.handleError(error, 'générer la facture'))
    );
  }

  imprimerFacture(vente: VenteMap): void {
    this.genererFacturePDF(vente);
  }

  private genererFacturePDF(vente: VenteMap): void {
    try {
      const html = this.creerHTMLFactureAvecLogo(vente);
      const fenetre = window.open('', '_blank');
      if (!fenetre) throw new Error('Impossible d\'ouvrir la fenêtre');
      fenetre.document.write(html);
      fenetre.document.close();
      fenetre.onload = () => setTimeout(() => { fenetre.focus(); fenetre.print(); fenetre.addEventListener('afterprint', () => fenetre.close()); }, 500);
    } catch (error) {
      console.error('Erreur génération facture:', error);
      throw new Error('Impossible de générer la facture');
    }
  }

  private creerHTMLFactureAvecLogo(vente: VenteMap): string {
    const date = this.formatDate(vente.dateVente);
    const boutique = this.boutiqueService.getInfo();
    
    // Utilisation du logo depuis assets/images/logo.png
    const logoSrc = this.LOGO_PATH;
    
    const styles = `
      <style>
        @media print { 
          @page { margin: 10mm; } 
          body { font-family: Arial, sans-serif; font-size: 9pt; margin: 0; padding: 0; }
          .no-print { display: none; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .invoice-container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .invoice-header { 
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white; 
          padding: 20px;
          text-align: center;
        }
        .logo-section {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 15px;
        }
        .logo-img {
          max-width: 80px;
          max-height: 80px;
          border-radius: 50%;
          background: white;
          padding: 5px;
          object-fit: contain;
        }
        .shop-name { 
          font-size: 22pt; 
          font-weight: bold; 
          margin: 10px 0 5px;
        }
        .shop-info {
          font-size: 9pt;
          opacity: 0.9;
          line-height: 1.5;
        }
        .facture-title {
          background: #f8f9fa;
          padding: 12px;
          text-align: center;
          border-bottom: 2px solid #2a5298;
        }
        .facture-num { 
          font-size: 16pt; 
          font-weight: bold; 
          color: #2a5298;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          padding: 20px;
          gap: 20px;
        }
        .info-card {
          flex: 1;
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
        }
        .info-card h4 {
          color: #2a5298;
          font-size: 10pt;
          margin-bottom: 10px;
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 5px;
        }
        .info-card p {
          margin: 5px 0;
          font-size: 9pt;
          line-height: 1.4;
        }
        .credit-info { 
          background: #fff3cd; 
          padding: 12px; 
          margin: 0 20px 20px;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 0 20px;
          width: calc(100% - 40px);
        }
        th, td { 
          border: 1px solid #dee2e6; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background: #2a5298; 
          color: white;
          font-weight: bold;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-section {
          margin: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .total-line {
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          margin: 5px 0;
          font-size: 10pt;
        }
        .grand-total {
          font-size: 14pt;
          font-weight: bold;
          color: #28a745;
          border-top: 2px solid #dee2e6;
          margin-top: 10px;
          padding-top: 10px;
        }
        .footer { 
          text-align: center; 
          padding: 15px;
          background: #f8f9fa;
          font-size: 8pt; 
          color: #6c757d;
          border-top: 1px solid #dee2e6;
        }
        .print-btn { 
          display: block; 
          margin: 20px auto; 
          padding: 10px 30px; 
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white; 
          border: none; 
          border-radius: 25px;
          cursor: pointer;
          font-size: 11pt;
          font-weight: bold;
        }
        .print-btn:hover { opacity: 0.9; transform: scale(1.02); }
      </style>
    `;

    // Informations de crédit
    const creditInfo = vente.estCredit ? `
      <div class="credit-info">
        <strong>🏦 VENTE À CRÉDIT</strong><br>
        📋 Client: ${this.escapeHtml(vente.clientNom || 'N/A')} ${this.escapeHtml(vente.clientPrenom || '')}<br>
        📞 Tél: ${this.escapeHtml(vente.clientTelephone || 'N/A')}<br>
        📅 Échéance: ${this.formatDateShort(vente.dateEcheance || '')}
        ${!vente.creditRegle ? 
          `<br><span style="color: #dc3545;">💰 Reste à payer: ${this.formatPrice(vente.montantRestant || 0)}</span>` : 
          `<br><span style="color: #28a745;">✅ Réglé le ${this.formatDateShort(vente.dateReglement || '')}</span>`}
      </div>
    ` : '';

    // Génération des lignes
    const lignesHtml = vente.produits.map(p => `
      <tr>
        <td><strong>${this.escapeHtml(p.produitNom || 'Produit')}</strong></td>
        <td class="text-center">${p.quantite}</td>
        <td class="text-right">${this.formatPrice(p.prixUnitaire)}</td>
        <td class="text-center">${p.remisePourcentage ? p.remisePourcentage + '%' : (p.remiseMontant ? this.formatPrice(p.remiseMontant) : '-')}</td>
        <td class="text-right"><strong>${this.formatPrice(p.sousTotal)}</strong></td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture ${vente.numeroVente}</title>
        ${styles}
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="logo-section">
              <img src="${logoSrc}" alt="Logo" class="logo-img" onerror="this.style.display='none'">
            </div>
            <div class="shop-name">${this.escapeHtml(boutique.nom || this.BOUTIQUE_NOM)}</div>
            <div class="shop-info">
              📍 ${this.escapeHtml(boutique.adresse || this.BOUTIQUE_ADRESSE)}<br>
              📞 ${this.escapeHtml(boutique.telephone || this.BOUTIQUE_TELEPHONE)}<br>
              ✉️ ${this.escapeHtml(boutique.email || this.BOUTIQUE_EMAIL)}
            </div>
          </div>
          
          <div class="facture-title">
            <div class="facture-num">FACTURE N° ${vente.numeroVente}</div>
            <div style="font-size: 10pt; color: #6c757d; margin-top: 5px;">Date: ${date}</div>
          </div>
          
          <div class="info-section">
            <div class="info-card">
              <h4>👤 VENDEUR</h4>
              <p><strong>Nom:</strong> ${this.escapeHtml(vente.vendeurNom)}</p>
            </div>
            <div class="info-card">
              <h4>💳 PAIEMENT</h4>
              <p><strong>Mode:</strong> ${this.getModePaiementLabel(vente.modePaiement)}</p>
              ${vente.referencePaiement ? `<p><strong>Réf:</strong> ${this.escapeHtml(vente.referencePaiement)}</p>` : ''}
            </div>
            <div class="info-card">
              <h4>👥 CLIENT</h4>
              <p><strong>Nom:</strong> ${this.escapeHtml(vente.clientNom || 'Client divers')} ${this.escapeHtml(vente.clientPrenom || '')}</p>
              ${vente.clientTelephone ? `<p><strong>Tél:</strong> ${this.escapeHtml(vente.clientTelephone)}</p>` : ''}
            </div>
          </div>
          
          ${creditInfo}
          
          <table>
            <thead>
              <tr>
                <th style="width: 45%">Désignation</th>
                <th style="width: 10%" class="text-center">Qté</th>
                <th style="width: 15%" class="text-right">Prix U.</th>
                <th style="width: 15%" class="text-center">Remise</th>
                <th style="width: 15%" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lignesHtml}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-line">
              <span>Sous-total:</span>
              <span><strong>${this.formatPrice(vente.montantTotal + (vente.montantRemiseTotal || 0))}</strong></span>
            </div>
            ${vente.montantRemiseTotal > 0 ? `
            <div class="total-line">
              <span>Remise globale:</span>
              <span style="color: #dc3545;">- ${this.formatPrice(vente.montantRemiseTotal)}</span>
            </div>
            ` : ''}
            <div class="total-line grand-total">
              <span>TOTAL À PAYER:</span>
              <span>${this.formatPrice(vente.montantTotal)}</span>
            </div>
            ${vente.estCredit && !vente.creditRegle && vente.montantVerse ? `
            <div class="total-line">
              <span>Déjà versé:</span>
              <span>${this.formatPrice(vente.montantVerse)}</span>
            </div>
            <div class="total-line">
              <span><strong>Reste à payer:</strong></span>
              <span><strong style="color: #dc3545;">${this.formatPrice(vente.montantRestant || 0)}</strong></span>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Merci de votre confiance ! À bientôt chez ${this.escapeHtml(boutique.nom || this.BOUTIQUE_NOM)}</p>
            <p style="margin-top: 5px;">Ce document fait office de facture et doit être conservé</p>
          </div>
          
          <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
          <button class="no-print" style="margin-left:10px;padding:10px 22px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer" onclick="window.close()">✕ Fermer</button>
          <script>window.addEventListener('afterprint',function(){window.close();});<\/script>
        </div>
      </body>
      </html>
    `;
    return html;
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==================== UTILITAIRES ====================

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price || 0);
  }

  formatPriceShort(price: number): string {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`;
    return Math.round(price).toString();
  }

  private formatPlainNumber(price: number): string {
    if (price === undefined || price === null) return '0';
    return Math.round(price).toLocaleString('fr-FR');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateString; }
  }

  formatDateShort(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateString; }
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  getModePaiementLabel(mode: string | ModePaiement): string {
    const labels: Record<string, string> = {
      'ESPECES': 'Espèces', 'ORANGE_MONEY': 'Orange Money', 'MOOV_MONEY': 'Moov Money',
      'WAVE_MONEY': 'Wave', 'CARTE_BANCAIRE': 'Carte Bancaire', 'VIREMENT': 'Virement'
    };
    return labels[String(mode)] || String(mode);
  }

  getModePaiementClass(mode: string | ModePaiement): string {
    const modes: Record<string, string> = {
      'ESPECES': 'bg-success', 'ORANGE_MONEY': 'bg-warning text-dark',
      'MOOV_MONEY': 'bg-info', 'WAVE_MONEY': 'bg-purple text-white', 'CARTE_BANCAIRE': 'bg-primary', 'VIREMENT': 'bg-secondary'
    };
    return modes[String(mode)] || 'bg-secondary';
  }

  getModePaiementOptions(): ModePaiement[] {
    return [ModePaiement.ESPECES, ModePaiement.ORANGE_MONEY, ModePaiement.MOOV_MONEY, ModePaiement.WAVE_MONEY, ModePaiement.CARTE_BANCAIRE, ModePaiement.VIREMENT];
  }

  getVendeurDisplay(vente: VenteMap): string {
    return vente.vendeurNom || 'N/A';
  }

  getCreditStatusClass(vente: VenteMap): string {
    if (vente.annulee) return 'badge bg-secondary';
    if (vente.creditRegle) return 'badge bg-success';
    if (!vente.dateEcheance) return 'badge bg-warning';
    const echeance = new Date(vente.dateEcheance);
    if (echeance < new Date()) return 'badge bg-danger';
    return 'badge bg-warning text-dark';
  }

  getCreditStatusText(vente: VenteMap): string {
    if (vente.annulee) return 'Annulé';
    if (vente.creditRegle) return 'Réglé';
    if (!vente.dateEcheance) return 'En attente';
    const echeance = new Date(vente.dateEcheance);
    if (echeance < new Date()) {
      const jours = Math.ceil((new Date().getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24));
      return `En retard (${jours}j)`;
    }
    const jours = Math.ceil((echeance.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return `À échoir (${jours}j)`;
  }

  calculerPrixApresRemise(prix: number, remisePourcentage?: number, remiseMontant?: number): number {
    let result = prix;
    if (remisePourcentage && remisePourcentage > 0) result = prix - (prix * remisePourcentage / 100);
    else if (remiseMontant && remiseMontant > 0) result = Math.max(0, prix - remiseMontant);
    return Math.round(result * 100) / 100;
  }

  calculerMontantRemise(prix: number, quantite: number, remisePourcentage?: number, remiseMontant?: number): number {
    const total = prix * quantite;
    const prixApres = this.calculerPrixApresRemise(prix, remisePourcentage, remiseMontant);
    return total - (prixApres * quantite);
  }

  getRoleLabel(role: string): string {
    const roles: Record<string, string> = { 'ADMIN': 'Administrateur', 'VENDEUR': 'Vendeur' };
    return roles[role] || role;
  }

  getCreditsParClient(clientNom: string): Observable<VenteMap[]> {
    return this.getCreditsParClientQuery(clientNom);
  }

  // ==================== EXPORTS PDF ====================

  exportVentesDetailToPDF(
    ventes: VenteMap[], 
    titre: string, 
    produits: any[], 
    dateDebut?: string, 
    dateFin?: string,
    clientInfo?: { nom: string, prenom?: string, telephone?: string }
  ): void {
    if (!ventes || ventes.length === 0) {
      throw new Error('Aucune vente à exporter');
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const boutique = this.boutiqueService.getInfo();
      const stats = this.calculateExportStats(ventes, produits);
      const dateGeneration = new Date();

      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(boutique.nom || this.BOUTIQUE_NOM, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(boutique.adresse || this.BOUTIQUE_ADRESSE, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      doc.text(`Tel: ${boutique.telephone || this.BOUTIQUE_TELEPHONE}`, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });
      doc.text(`Email: ${boutique.email || this.BOUTIQUE_EMAIL}`, doc.internal.pageSize.getWidth() / 2, 36, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(titre.replace(/_/g, ' '), doc.internal.pageSize.getWidth() / 2, 48, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const dateStr = this.formatDateTimeForExport(dateGeneration.toISOString());
      doc.text(`Généré le: ${dateStr}`, doc.internal.pageSize.getWidth() - 20, 55, { align: 'right' });

      let periodeText = '';
      if (dateDebut && dateFin) {
        periodeText = `Période: du ${this.formatDateShort(dateDebut)} au ${this.formatDateShort(dateFin)}`;
      } else if (dateDebut) {
        periodeText = `Période: à partir du ${this.formatDateShort(dateDebut)}`;
      } else if (dateFin) {
        periodeText = `Période: jusqu'au ${this.formatDateShort(dateFin)}`;
      } else {
        periodeText = `Période: Toutes les ventes`;
      }
      doc.text(periodeText, 20, 55);

      if (clientInfo && clientInfo.nom) {
        doc.text(`Client: ${clientInfo.nom} ${clientInfo.prenom || ''}${clientInfo.telephone ? ` - Tél: ${clientInfo.telephone}` : ''}`, 20, 62);
      }

      let startY = 72;
      const cardWidth = 45;
      const cardHeight = 28;
      
      const statsCards = [
        { label: 'CA Total', value: this.formatPlainNumber(stats.caTotal), color: [52, 152, 219] },
        { label: 'Bénéfice Total', value: this.formatPlainNumber(stats.beneficeTotal), color: [46, 204, 113] },
        { label: 'Marge Moyenne', value: `${stats.margeMoyenne.toFixed(1)}%`, color: [241, 196, 15] },
        { label: 'CA Aujourd\'hui', value: this.formatPlainNumber(stats.caToday), color: [155, 89, 182] },
        { label: 'Bénéfice Aujourd\'hui', value: this.formatPlainNumber(stats.beneficeToday), color: [230, 126, 34] },
        { label: 'Marge Aujourd\'hui', value: `${stats.margeToday.toFixed(1)}%`, color: [231, 76, 60] }
      ];

      statsCards.forEach((card, index) => {
        const x = 20 + (index * (cardWidth + 5));
        if (x + cardWidth <= doc.internal.pageSize.getWidth() - 20) {
          doc.setFillColor(card.color[0], card.color[1], card.color[2]);
          doc.rect(x, startY, cardWidth, cardHeight, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.text(card.label, x + cardWidth / 2, startY + 7, { align: 'center' });
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          doc.text(card.value, x + cardWidth / 2, startY + 18, { align: 'center' });
        }
      });

      startY += cardHeight + 5;
      const secondRowCards = [
        { label: 'Total Ventes', value: stats.nombreVentes.toString(), color: [52, 73, 94] },
        { label: 'Ventes Comptant', value: stats.nombreVentesComptant.toString(), color: [39, 174, 96] },
        { label: 'Montant Comptant', value: this.formatPlainNumber(stats.montantTotalComptant), color: [39, 174, 96] },
        { label: 'Ventes Crédit', value: stats.nombreVentesCredit.toString(), color: [241, 196, 15] },
        { label: 'Montant Crédit', value: this.formatPlainNumber(stats.montantTotalCredit), color: [241, 196, 15] },
        { label: 'Crédits en cours', value: this.formatPlainNumber(stats.montantCreditsEnCours), color: [230, 126, 34] }
      ];

      secondRowCards.forEach((card, index) => {
        const x = 20 + (index * (cardWidth + 4));
        if (x + cardWidth <= doc.internal.pageSize.getWidth() - 20) {
          doc.setFillColor(card.color[0], card.color[1], card.color[2]);
          doc.rect(x, startY, cardWidth, cardHeight, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.text(card.label, x + cardWidth / 2, startY + 7, { align: 'center' });
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          doc.text(card.value, x + cardWidth / 2, startY + 18, { align: 'center' });
        }
      });

      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);

      doc.addPage();
      
      doc.setFontSize(14);
      doc.text('DÉTAIL DES VENTES', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Nombre total de ventes: ${ventes.length}`, 20, 25);

      const tableData = ventes.map(vente => [
        vente.numeroVente,
        this.formatDateShort(vente.dateVente),
        this.formatTime(vente.dateVente),
        vente.clientNom || (vente.clientDivers ? 'Client divers' : '-'),
        vente.clientTelephone || '-',
        vente.annulee ? 'ANNULÉE' : (!vente.estCredit ? 'COMPTANT' : (vente.creditRegle ? 'CRÉDIT RÉGLÉ' : (this.isCreditEnRetard(vente) ? 'CRÉDIT RETARD' : 'CRÉDIT'))),
        this.getModePaiementLabel(vente.modePaiement),
        this.formatPlainNumber(vente.montantTotal),
        vente.estCredit ? this.formatPlainNumber(vente.montantVerse || 0) : '-',
        vente.estCredit ? this.formatPlainNumber(vente.montantRestant || vente.montantTotal) : '-',
        vente.vendeurNom,
        vente.produits?.map(p => `${p.quantite}x ${p.produitNom}`).join(', ') || '-'
      ]);

      autoTable(doc, {
        startY: 32,
        head: [['N°', 'Date', 'Heure', 'Client', 'Tél', 'Type', 'Paiement', 'Montant', 'Versé', 'Reste', 'Vendeur', 'Produits']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [52, 73, 94], textColor: 255, fontSize: 7, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 15 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 },
          5: { cellWidth: 22 },
          6: { cellWidth: 20 },
          7: { cellWidth: 22, halign: 'right' },
          8: { cellWidth: 20, halign: 'right' },
          9: { cellWidth: 20, halign: 'right' },
          10: { cellWidth: 25 },
          11: { cellWidth: 50 }
        },
        didDrawPage: (data: any) => {
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Page ${data.pageNumber} / ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
          doc.text('Merci de votre confiance !', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }
      });

      let fileName = `${titre.replace(/ /g, '_')}`;
      if (dateDebut && dateFin) {
        fileName += `_${this.formatDateForFileName(dateDebut)}_AU_${this.formatDateForFileName(dateFin)}`;
      } else if (dateDebut) {
        fileName += `_DEPUIS_${this.formatDateForFileName(dateDebut)}`;
      } else if (dateFin) {
        fileName += `_JUSQUAU_${this.formatDateForFileName(dateFin)}`;
      }
      if (clientInfo && clientInfo.nom) {
        fileName += `_CLIENT_${clientInfo.nom}`;
      }
      fileName += `_${this.formatDateForFileName(dateGeneration.toISOString())}.pdf`;
      
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  exportVentesParPeriodeToPDF(ventes: VenteMap[], produits: any[], dateDebut: string, dateFin: string, titre?: string): void {
    const titreRapport = titre || `RAPPORT_VENTES_${this.formatDateForFileName(dateDebut)}_AU_${this.formatDateForFileName(dateFin)}`;
    this.exportVentesDetailToPDF(ventes, titreRapport, produits, dateDebut, dateFin);
  }

  exportVentesDuJourToPDF(ventes: VenteMap[], produits: any[]): void {
    const aujourdhui = this.formatDateForFileName(new Date().toISOString());
    this.exportVentesDetailToPDF(ventes, `VENTES_DU_JOUR_${aujourdhui}`, produits, aujourdhui, aujourdhui);
  }

  exportToutesVentesToPDF(ventes: VenteMap[], produits: any[]): void {
    this.exportVentesDetailToPDF(ventes, 'RAPPORT_COMPLET_DES_VENTES', produits);
  }

  exportVentesParClientToPDF(ventes: VenteMap[], produits: any[], clientNom: string, clientPrenom?: string, clientTelephone?: string): void {
    const titre = `VENTES_CLIENT_${clientNom}_${clientPrenom || ''}`.toUpperCase();
    this.exportVentesDetailToPDF(ventes, titre, produits, undefined, undefined, {
      nom: clientNom,
      prenom: clientPrenom,
      telephone: clientTelephone
    });
  }

  exportVentesClientDiversToPDF(ventes: VenteMap[], produits: any[]): void {
    this.exportVentesDetailToPDF(ventes, 'VENTES_CLIENTS_DIVERS', produits);
  }

  exportVentesCreditToPDF(ventes: VenteMap[], produits: any[]): void {
    this.exportVentesDetailToPDF(ventes, 'RAPPORT_VENTES_CREDIT', produits);
  }

  exportCreditsEnRetardToPDF(ventes: VenteMap[], produits: any[]): void {
    this.exportVentesDetailToPDF(ventes, 'RAPPORT_CREDITS_EN_RETARD', produits);
  }

  exportVentesSemaineToPDF(ventes: VenteMap[], produits: any[]): void {
    const aujourdhui = new Date();
    const debutSemaine = new Date(aujourdhui);
    debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay());
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6);
    
    this.exportVentesParPeriodeToPDF(
      ventes, 
      produits, 
      this.formatDateForFileName(debutSemaine.toISOString()), 
      this.formatDateForFileName(finSemaine.toISOString()),
      `RAPPORT_SEMAINE_${this.formatDateForFileName(debutSemaine.toISOString())}`
    );
  }

  exportVentesMoisToPDF(ventes: VenteMap[], produits: any[]): void {
    const aujourdhui = new Date();
    const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
    const finMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0);
    
    this.exportVentesParPeriodeToPDF(
      ventes, 
      produits, 
      this.formatDateForFileName(debutMois.toISOString()), 
      this.formatDateForFileName(finMois.toISOString()),
      `RAPPORT_MOIS_${aujourdhui.getFullYear()}_${String(aujourdhui.getMonth() + 1).padStart(2, '0')}`
    );
  }

  exportVentesToPDF(ventes: VenteMap[], titre: string = 'LISTE_DES_VENTES'): void {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const boutique = this.boutiqueService.getInfo();
      const date = new Date();

      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(boutique.nom || this.BOUTIQUE_NOM, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(boutique.adresse || this.BOUTIQUE_ADRESSE, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      doc.text(`Tel: ${boutique.telephone || this.BOUTIQUE_TELEPHONE}`, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(titre.replace(/_/g, ' '), doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const dateStr = this.formatDateTimeForExport(date.toISOString());
      doc.text(`Généré le: ${dateStr}`, doc.internal.pageSize.getWidth() - 20, 50, { align: 'right' });
      doc.text(`Nombre total: ${ventes.length} vente(s)`, 20, 50);

      const tableData = ventes.map(vente => [
        vente.numeroVente,
        this.formatDateForExport(vente.dateVente),
        this.formatHeureForExport(vente.dateVente),
        vente.clientNom || 'Client divers',
        vente.clientTelephone || '-',
        vente.annulee ? 'ANNULÉE' : (!vente.estCredit ? 'COMPTANT' : (vente.creditRegle ? 'CRÉDIT RÉGLÉ' : (this.isCreditEnRetard(vente) ? 'CRÉDIT RETARD' : 'CRÉDIT'))),
        this.getModePaiementLabel(vente.modePaiement),
        this.formatPlainNumber(vente.montantTotal),
        vente.estCredit ? this.formatPlainNumber(vente.montantVerse || 0) : '-',
        vente.estCredit ? this.formatPlainNumber(vente.montantRestant || vente.montantTotal) : '-',
        vente.vendeurNom
      ]);

      autoTable(doc, {
        startY: 58,
        head: [['N° Facture', 'Date', 'Heure', 'Client', 'Téléphone', 'Type', 'Paiement', 'Montant', 'Versé', 'Reste', 'Vendeur']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [52, 73, 94], textColor: 255, fontSize: 7, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 22 },
          2: { cellWidth: 18 },
          3: { cellWidth: 35 },
          4: { cellWidth: 22 },
          5: { cellWidth: 25 },
          6: { cellWidth: 22 },
          7: { cellWidth: 20, halign: 'right' },
          8: { cellWidth: 20, halign: 'right' },
          9: { cellWidth: 20, halign: 'right' },
          10: { cellWidth: 28 }
        },
        didDrawPage: (data: any) => {
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Page ${data.pageNumber} / ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY || 58;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Merci de votre confiance !', doc.internal.pageSize.getWidth() / 2, finalY + 10, { align: 'center' });

      const fileName = `${titre}_${this.formatDateForFileName(new Date().toISOString())}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  exportAllVentesDetailToPDF(ventes: VenteMap[], titre: string = 'RAPPORT_COMPLET_DES_VENTES'): void {
    if (!ventes || ventes.length === 0) {
      throw new Error('Aucune vente à exporter');
    }
    
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const boutique = this.boutiqueService.getInfo();
      const date = new Date();

      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(boutique.nom || this.BOUTIQUE_NOM, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(boutique.adresse || this.BOUTIQUE_ADRESSE, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      doc.text(`Tel: ${boutique.telephone || this.BOUTIQUE_TELEPHONE}`, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(titre.replace(/_/g, ' '), doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Généré le: ${this.formatDateTimeForExport(date.toISOString())}`, doc.internal.pageSize.getWidth() - 20, 50, { align: 'right' });

      let currentY = 58;
      
      for (let index = 0; index < ventes.length; index++) {
        const vente = ventes[index];
        
        if (currentY > 180) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFillColor(52, 73, 94);
        doc.rect(20, currentY, 280, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`VENTE N° ${vente.numeroVente}`, 25, currentY + 5);
        doc.text(`Date: ${this.formatDateForExport(vente.dateVente)} ${this.formatHeureForExport(vente.dateVente)}`, 150, currentY + 5);
        doc.text(`Type: ${vente.annulee ? 'ANNULÉE' : (!vente.estCredit ? 'COMPTANT' : (vente.creditRegle ? 'CRÉDIT RÉGLÉ' : 'CRÉDIT'))}`, 230, currentY + 5);
        
        currentY += 12;
        
        doc.setFillColor(240, 240, 240);
        doc.rect(20, currentY, 280, 20, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.text(`Client: ${vente.clientNom || 'Client divers'} ${vente.clientPrenom || ''}`, 25, currentY + 5);
        doc.text(`Téléphone: ${vente.clientTelephone || '-'}`, 25, currentY + 10);
        doc.text(`Vendeur: ${vente.vendeurNom}`, 25, currentY + 15);
        doc.text(`Mode paiement: ${this.getModePaiementLabel(vente.modePaiement)}`, 180, currentY + 5);
        doc.text(`Référence: ${vente.referencePaiement || '-'}`, 180, currentY + 10);
        if (vente.estCredit) {
          doc.text(`Échéance: ${this.formatDateForExport(vente.dateEcheance || '')}`, 180, currentY + 15);
        }
        
        currentY += 24;
        
        const produitsData = vente.produits.map(p => [
          p.produitNom || 'Produit',
          p.quantite.toString(),
          this.formatPlainNumber(p.prixUnitaire),
          p.remisePourcentage ? `${p.remisePourcentage}%` : (p.remiseMontant ? this.formatPlainNumber(p.remiseMontant) : '-'),
          this.formatPlainNumber(p.sousTotal)
        ]);
        
        autoTable(doc, {
          startY: currentY,
          head: [['Désignation', 'Qté', 'Prix U.', 'Remise', 'Total']],
          body: produitsData,
          theme: 'striped',
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [100, 100, 100], textColor: 255, fontSize: 7 },
          columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' },
            4: { cellWidth: 45, halign: 'right' }
          },
          margin: { left: 20, right: 20 }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 5;
        
        doc.setFillColor(52, 152, 219);
        doc.rect(200, currentY, 100, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL: ${this.formatPlainNumber(vente.montantTotal)}`, 250, currentY + 5, { align: 'right' });
        
        currentY += 15;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, currentY, 300, currentY);
        currentY += 8;
      }
      
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
        doc.text('Merci de votre confiance !', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      doc.save(`${titre.replace(/\s/g, '_')}_${this.formatDateForFileName(new Date().toISOString())}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  exportVentesComptantToPDF(ventes: VenteMap[]): void {
    const ventesComptant = ventes.filter(v => !v.estCredit && !v.annulee);
    if (ventesComptant.length === 0) {
      throw new Error('Aucune vente comptant à exporter');
    }
    this.exportVentesToPDF(ventesComptant, 'LISTE_DES_VENTES_COMPTANT');
  }

  exportVentesCreditToPDFSimple(ventes: VenteMap[]): void {
    const ventesCredit = ventes.filter(v => v.estCredit && !v.annulee);
    if (ventesCredit.length === 0) {
      throw new Error('Aucune vente crédit à exporter');
    }
    this.exportVentesToPDF(ventesCredit, 'LISTE_DES_VENTES_CREDIT');
  }

  exportVentesCreditDetailToPDF(ventes: VenteMap[]): void {
    const ventesCredit = ventes.filter(v => v.estCredit && !v.annulee);
    if (ventesCredit.length === 0) {
      throw new Error('Aucune vente crédit à exporter');
    }
    this.exportAllVentesDetailToPDF(ventesCredit, 'RAPPORT_DES_VENTES_CREDIT');
  }

  exportCreditsRetardDetailToPDF(ventes: VenteMap[]): void {
    const creditsRetard = ventes.filter(v => v.estCredit && !v.annulee && !v.creditRegle && this.isCreditEnRetard(v));
    if (creditsRetard.length === 0) {
      throw new Error('Aucun crédit en retard à exporter');
    }
    this.exportAllVentesDetailToPDF(creditsRetard, 'RAPPORT_DES_CREDITS_EN_RETARD');
  }

  exportVentesClientDetailToPDF(ventes: VenteMap[], clientNom: string, clientPrenom: string = ''): void {
    if (ventes.length === 0) {
      throw new Error('Aucune vente trouvée pour ce client');
    }
    const titre = `VENTES_CLIENT_${clientNom}_${clientPrenom}`.toUpperCase();
    this.exportAllVentesDetailToPDF(ventes, titre);
  }

  exportVentesClientDiversDetailToPDF(ventes: VenteMap[]): void {
    if (ventes.length === 0) {
      throw new Error('Aucune vente client divers à exporter');
    }
    this.exportAllVentesDetailToPDF(ventes, 'RAPPORT_VENTES_CLIENTS_DIVERS');
  }

  exportVentesAvecFiltresToPDF(ventes: VenteMap[], type: string = 'TOUTES'): void {
    let titre = 'RAPPORT_DES_VENTES';
    if (type === 'COMPTANT') titre = 'RAPPORT_DES_VENTES_COMPTANT';
    else if (type === 'CREDIT') titre = 'RAPPORT_DES_VENTES_CREDIT';
    else if (type === 'CREDIT_RETARD') titre = 'RAPPORT_DES_VENTES_CREDIT_RETARD';
    this.exportAllVentesDetailToPDF(ventes, titre);
  }

  // ==================== MÉTHODES UTILITAIRES POUR EXPORT ====================

  formatDateForExport(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  }

  formatHeureForExport(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  }

  formatDateTimeForExport(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  formatDateForFileName(dateString: string): string {
    if (!dateString) return 'date';
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return 'date';
    }
  }

  isCreditEnRetard(vente: VenteMap): boolean {
    if (!vente.estCredit || !vente.dateEcheance || vente.creditRegle) return false;
    const echeance = new Date(vente.dateEcheance);
    const aujourdhui = new Date();
    return echeance < aujourdhui;
  }

  exportVentesDetailleesToPDF(ventes: VenteMap[], titre: string = 'RAPPORT_COMPLET_DES_VENTES'): void {
    this.exportAllVentesDetailToPDF(ventes, titre);
  }

  // ==================== SUPPRESSION ====================

  supprimerVente(venteId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${venteId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'supprimer la vente'))
    );
  }

  supprimerVenteCredit(venteId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/credits/${venteId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'supprimer le crédit'))
    );
  }

  getVenteCreditById(id: number): Observable<VenteMap> {
    return this.http.get<any>(`${this.apiUrl}/credit/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.mapVenteResponse(response)),
      catchError(error => this.handleError(error, `récupérer le crédit ${id}`))
    );
  }

  private getCreditsParClientQuery(clientNom: string): Observable<VenteMap[]> {
    return this.http.get<any>(`${this.apiUrl}/credits/client`, {
      headers: this.getAuthHeaders(),
      params: new HttpParams().set('clientNom', clientNom)
    }).pipe(
      map(response => {
        const credits = response.credits || response.data || response;
        if (Array.isArray(credits)) {
          return credits.map(c => this.mapVenteResponse(c));
        }
        return [];
      }),
      catchError(error => this.handleError(error, 'récupérer les crédits par client'))
    );
  }

  private calculateExportStats(ventes: VenteMap[], produits: any[]): ExportStats {
    const aujourdhui = new Date().toISOString().split('T')[0];
    
    let caTotal = 0;
    let beneficeTotal = 0;
    let caToday = 0;
    let beneficeToday = 0;
    let nombreVentes = 0;
    let nombreVentesComptant = 0;
    let nombreVentesCredit = 0;
    let montantTotalComptant = 0;
    let montantTotalCredit = 0;
    let montantCreditsEnCours = 0;

    for (const vente of ventes) {
      if (vente.annulee) continue;
      
      caTotal += vente.montantTotal;
      nombreVentes++;
      
      if (!vente.estCredit) {
        nombreVentesComptant++;
        montantTotalComptant += vente.montantTotal;
      } else {
        nombreVentesCredit++;
        montantTotalCredit += vente.montantTotal;
        if (!vente.creditRegle) {
          montantCreditsEnCours += (vente.montantRestant || vente.montantTotal);
        }
      }

      let venteBenefice = 0;
      if (vente.produits && vente.produits.length > 0) {
        for (const produitVente of vente.produits) {
          const produitComplet = produits.find(p => p.id === produitVente.produitId);
          if (produitComplet && produitComplet.prixAchat) {
            venteBenefice += (produitVente.prixUnitaire - produitComplet.prixAchat) * produitVente.quantite;
          }
        }
      }
      beneficeTotal += venteBenefice;

      if (vente.dateVente?.startsWith(aujourdhui)) {
        caToday += vente.montantTotal;
        
        let venteBeneficeToday = 0;
        if (vente.produits && vente.produits.length > 0) {
          for (const produitVente of vente.produits) {
            const produitComplet = produits.find(p => p.id === produitVente.produitId);
            if (produitComplet && produitComplet.prixAchat) {
              venteBeneficeToday += (produitVente.prixUnitaire - produitComplet.prixAchat) * produitVente.quantite;
            }
          }
        }
        beneficeToday += venteBeneficeToday;
      }
    }

    const margeMoyenne = caTotal > 0 ? (beneficeTotal / caTotal) * 100 : 0;
    const margeToday = caToday > 0 ? (beneficeToday / caToday) * 100 : 0;

    return {
      caTotal,
      caToday,
      beneficeTotal,
      beneficeToday,
      margeMoyenne,
      margeToday,
      nombreVentes,
      nombreVentesComptant,
      nombreVentesCredit,
      montantTotalComptant,
      montantTotalCredit,
      montantCreditsEnCours
    };
  }
}