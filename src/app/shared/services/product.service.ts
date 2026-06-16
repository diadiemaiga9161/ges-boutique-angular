// src/app/shared/services/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Observable, of, throwError } from 'rxjs';

export interface Fournisseur {
  id: number;
  nom: string;
  code: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  contactNom?: string;
  contactTelephone?: string;
  contactEmail?: string;
  description?: string;
  typeProduits?: string;
  conditionsPaiement?: string;
  delaiLivraison?: number;
  note?: number;
  actif: boolean;
  dateAjout?: string;
  dateModification?: string;
  produits?: Produit[];
  nombreProduits?: number;
  totalAchats?: number;
  totalPaye?: number;
  solde?: number;
}

export interface FournisseurDto {
  id: number;
  nom: string;
  code: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  contactNom?: string;
  contactTelephone?: string;
  contactEmail?: string;
  description?: string;
  typeProduits?: string;
  conditionsPaiement?: string;
  delaiLivraison?: number;
  note?: number;
  actif: boolean;
  nombreProduits: number;
}

export interface FournisseurRequest {
  nom: string;
  code: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  contactNom?: string;
  contactTelephone?: string;
  contactEmail?: string;
  description?: string;
  typeProduits?: string;
  conditionsPaiement?: string;
  delaiLivraison?: number;
  note?: number;
  actif: boolean;
}

export interface Categorie {
  id: number;
  nom: string;
  description: string;
  dateCreation: string;
}

export interface CategorieDto {
  id: number;
  nom: string;
  description: string;
}

export interface Produit {
  id: number;
  nom: string;
  description: string;
  categorie: Categorie;
  fournisseur?: Fournisseur;
  prixAchat: number;
  prixVente: number;
  quantite: number;
  seuilAlerte: number;
  codeBarre: string;
  dateCreation: string;
  datePeremption?: string;
  lotNumber?: string;
  conditionsStockage?: string;
  poidsVolume?: number;
  uniteMesure?: string;
  bio: boolean;
  origine?: string;
  dateAjout: string;
  dateModification: string;
  stockFaible?: boolean;
  perime?: boolean;
  prochePeremption?: boolean;
  marge?: number;
  tauxMarge?: number;
  joursAvantPeremption?: number;
  typeVente?: string;
}

export interface ProduitDto {
  id: number;
  nom: string;
  description: string;
  categorieId: number;
  categorieNom: string;
  fournisseurId?: number;
  fournisseurNom?: string;
  prixAchat: number;
  prixVente: number;
  quantite: number;
  seuilAlerte: number;
  codeBarre: string;
  dateCreation: string;
  datePeremption?: string;
  lotNumber?: string;
  conditionsStockage?: string;
  poidsVolume?: number;
  uniteMesure?: string;
  bio: boolean;
  origine?: string;
  stockFaible: boolean;
  perime: boolean;
  prochePeremption: boolean;
  marge: number;
  tauxMarge: number;
  joursAvantPeremption?: number;
  typeVente?: string;
}

export interface ProduitRequest {
  nom: string;
  description?: string;
  categorieId: number;
  fournisseurId?: number;
  prixAchat: number;
  prixVente: number;
  quantite: number;
  seuilAlerte?: number;
  codeBarre?: string;
  dateCreation?: string;
  datePeremption?: string;
  lotNumber?: string;
  conditionsStockage?: string;
  poidsVolume?: number;
  uniteMesure?: string;
  bio?: boolean;
  origine?: string;
  typeVente?: string;
}

export interface ProduitUpdate {
  nom?: string;
  description?: string;
  categorieId?: number;
  fournisseurId?: number;
  prixAchat?: number;
  prixVente?: number;
  quantite?: number;
  seuilAlerte?: number;
  codeBarre?: string;
  dateCreation?: string;
  datePeremption?: string;
  lotNumber?: string;
  conditionsStockage?: string;
  poidsVolume?: number;
  uniteMesure?: string;
  bio?: boolean;
  origine?: string;
  typeVente?: string;
}

export interface StatistiquesStock {
  valeurTotale: number;
  produitsStockFaible: number;
  produitsRupture: number;
  produitsPerimes: number;
  produitsProchePeremption: number;
  totalProduits: number;
  totalFournisseurs: number;
  pourcentageStockFaible?: number;
  pourcentageRupture?: number;
  pourcentagePerimes?: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors: string[];
  details?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LigneAchatRequest {
  produitId?: number;
  nouveauProduitNom?: string;
  nouvelleCategorieId?: number;
  prixVente?: number;
  description?: string;
  codeBarre?: string;
  seuilAlerte?: number;
  uniteMesure?: string;
  bio?: boolean;
  origine?: string;
  typeVente?: string;
  quantite: number;
  prixAchatUnitaire: number;
}

export interface FournisseurRequestWithOptionalId {
  nom: string;
  code: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  contactNom?: string;
  contactTelephone?: string;
  contactEmail?: string;
  description?: string;
  typeProduits?: string;
  conditionsPaiement?: string;
  delaiLivraison?: number;
  note?: number;
  actif?: boolean;
}

export interface AchatFournisseurRequest {
  fournisseurId?: number;
  nouveauFournisseur?: FournisseurRequestWithOptionalId;
  lignes: LigneAchatRequest[];
  montantPaye?: number;
  montantAvanceUtilise?: number;
  commentaire?: string;
  utilisateurId?: number;
  modePaiementImmediat?: string;
  compteIdPaiement?: number;
}

export interface LigneAchatFournisseur {
  id: number;
  produit: Produit;
  quantite: number;
  prixAchatUnitaire: number;
  sousTotal: number;
}

export interface AchatFournisseur {
  id: number;
  dateAchat: string;
  fournisseur: Fournisseur;
  montantTotal: number;
  montantPaye: number;
  montantRestant: number;
  montantAvanceUtilise?: number;
  modePaiementImmediat?: string;
  compteIdPaiement?: number;
  statut: 'EN_COURS' | 'PAYE' | 'ANNULE';
  commentaire?: string;
  utilisateurId?: number;
  dateCreation: string;
  lignes: LigneAchatFournisseur[];
}

export interface PaiementFournisseurRequest {
  fournisseurId: number;
  montant: number;
  modePaiement: 'ESPECES' | 'VIREMENT' | 'CHEQUE' | 'BANQUE';
  reference?: string;
  observation?: string;
  utilisateurId?: number;
  compteId?: number;
  achatCibleId?: number;
}

export interface AvanceFournisseurRequest {
  fournisseurId: number;
  montant: number;
  motif?: string;
  sourceFinancement: 'CAISSE' | 'BANQUE';
  compteId?: number;
  utilisateurId?: number;
}

export interface AvanceFournisseur {
  id: number;
  fournisseurId: number;
  fournisseurNom: string;
  montant: number;
  montantUtilise: number;
  montantDisponible: number;
  dateDepot: string;
  motif?: string;
  statut: 'DISPONIBLE' | 'UTILISE_PARTIELLEMENT' | 'EPUISE';
  sourceFinancement: string;
  compteId?: number;
}

export interface LigneRetourAchatRequest {
  ligneAchatId?: number;
  produitId: number;
  quantiteRetournee: number;
  prixUnitaire: number;
}

export interface RetourAchatRequest {
  achatId: number;
  motif?: string;
  modeRemboursement: 'CAISSE' | 'BANQUE';
  compteId?: number;
  utilisateurId?: number;
  lignes: LigneRetourAchatRequest[];
}

export interface RetourAchat {
  id: number;
  numeroRetour: string;
  achat: any;
  fournisseur: any;
  lignes: any[];
  montantTotal: number;
  montantRembourse: number;
  montantDetteReduit: number;
  dateRetour: string;
  motif?: string;
  modeRemboursement: string;
  compteId?: number;
}

export interface RetourVenteRequest {
  venteId: number;
  motif?: string;
  utilisateurId?: number;
  lignes: LigneRetourVenteRequest[];
}

export interface LigneRetourVenteRequest {
  ligneVenteId?: number;
  produitId: number;
  quantiteRetournee: number;
  prixUnitaire: number;
}

export interface RetourVente {
  id: number;
  numeroRetour: string;
  vente: any;
  lignes: any[];
  montantTotal: number;
  dateRetour: string;
  motif?: string;
  clientNom?: string;
}

export interface PaiementFournisseur {
  id: number;
  datePaiement: string;
  fournisseur: Fournisseur;
  montant: number;
  modePaiement: string;
  reference?: string;
  observation?: string;
  utilisateurId?: number;
}

export interface FournisseurCompteDto {
  fournisseur: FournisseurDto;
  totalAchats: number;
  totalPaye: number;
  solde: number;
  achatsRecents: AchatFournisseur[];
  paiementsRecents: PaiementFournisseur[];
}

export interface ProduitSimple {
  id: number;
  nom: string;
  codeBarre: string;
  uniteMesure: string;
  prixAchat: number;
  prixVente: number;
  quantite: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/produits`;
  private fournisseurAchatApiUrl = `${environment.apiUrl}/fournisseur-achats`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token non disponible. Veuillez vous reconnecter.');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private handleError(error: any, context: string): Observable<never> {
    console.error(`❌ Erreur lors de ${context}:`, error);
    let errorMessage = `Impossible de ${context}`;
    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else if (error.status === 400) {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors.join(', ');
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.';
      }
    } else if (error.status === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      this.authService.signout();
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée';
    } else if (error.status === 409) {
      errorMessage = 'Conflit de données. Cette ressource existe peut-être déjà.';
    } else if (error.status === 413) {
      errorMessage = 'Fichier trop volumineux. La taille maximale est de 10MB.';
    } else if (error.status === 415) {
      errorMessage = 'Format de fichier non supporté.';
    } else if (error.status === 500) {
      if (error.error && error.error.message) {
        errorMessage = `Erreur serveur: ${error.error.message}`;
      } else {
        errorMessage = 'Erreur serveur interne. Veuillez contacter l\'administrateur.';
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  private extractData<T>(response: any): T {
    if (!response) return {} as T;
    if (response.data) return response.data as T;
    return response as T;
  }

  getProducts(): Observable<Produit[]> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit[]>(response) || []),
      map(produits => produits.map(p => this.enrichirProduit(p))),
      catchError(error => this.handleError(error, 'récupération des produits'))
    );
  }

  getProductsDto(): Observable<ProduitDto[]> {
    return this.http.get<any>(`${this.apiUrl}/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto[]>(response) || []),
      catchError(error => this.handleError(error, 'récupération des produits (DTO)'))
    );
  }

  getProductById(id: number): Observable<Produit> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit>(response)),
      map(produit => this.enrichirProduit(produit)),
      catchError(error => this.handleError(error, `récupération du produit ${id}`))
    );
  }

  getProductDtoById(id: number): Observable<ProduitDto> {
    return this.http.get<any>(`${this.apiUrl}/${id}/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto>(response)),
      catchError(error => this.handleError(error, `récupération du produit ${id} (DTO)`))
    );
  }

  createProduct(productData: ProduitRequest): Observable<Produit> {
    if (!productData.categorieId) {
      return throwError(() => new Error('Catégorie non spécifiée'));
    }
    const requestData = {
      ...productData,
      seuilAlerte: productData.seuilAlerte || 10,
      codeBarre: productData.codeBarre || '',
      bio: productData.bio || false
    };
    return this.http.post<any>(this.apiUrl, requestData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit>(response)),
      map(produit => this.enrichirProduit(produit)),
      catchError(error => this.handleError(error, 'création du produit'))
    );
  }

  createProductDto(productData: ProduitRequest): Observable<ProduitDto> {
    if (!productData.categorieId) {
      return throwError(() => new Error('Catégorie non spécifiée'));
    }
    const requestData = {
      ...productData,
      seuilAlerte: productData.seuilAlerte || 10,
      codeBarre: productData.codeBarre || '',
      bio: productData.bio || false
    };
    return this.http.post<any>(`${this.apiUrl}/dto`, requestData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto>(response)),
      catchError(error => this.handleError(error, 'création du produit (DTO)'))
    );
  }

  updateProduct(id: number, productData: ProduitUpdate): Observable<Produit> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, productData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit>(response)),
      map(produit => this.enrichirProduit(produit)),
      catchError(error => this.handleError(error, `mise à jour du produit ${id}`))
    );
  }

  updateProductDto(id: number, productData: ProduitUpdate): Observable<ProduitDto> {
    return this.http.put<any>(`${this.apiUrl}/${id}/dto`, productData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto>(response)),
      catchError(error => this.handleError(error, `mise à jour du produit ${id} (DTO)`))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, `suppression du produit ${id}`))
    );
  }

  getProductsByCategory(categoryId: number): Observable<Produit[]> {
    return this.http.get<any>(`${this.apiUrl}/categorie/${categoryId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit[]>(response) || []),
      map(produits => produits.map(p => this.enrichirProduit(p))),
      catchError(error => this.handleError(error, `produits de la catégorie ${categoryId}`))
    );
  }

  getProductsDtoByCategory(categoryId: number): Observable<ProduitDto[]> {
    return this.http.get<any>(`${this.apiUrl}/categorie/${categoryId}/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto[]>(response) || []),
      catchError(error => this.handleError(error, `produits DTO de la catégorie ${categoryId}`))
    );
  }

  getProductsByFournisseur(fournisseurId: number): Observable<Produit[]> {
    return this.http.get<any>(`${this.apiUrl}/fournisseur/${fournisseurId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit[]>(response) || []),
      map(produits => produits.map(p => this.enrichirProduit(p))),
      catchError(error => this.handleError(error, `produits du fournisseur ${fournisseurId}`))
    );
  }

  getProductsDtoByFournisseur(fournisseurId: number): Observable<ProduitDto[]> {
    return this.http.get<any>(`${this.apiUrl}/fournisseur/${fournisseurId}/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto[]>(response) || []),
      catchError(error => this.handleError(error, `produits DTO du fournisseur ${fournisseurId}`))
    );
  }

  searchProducts(searchTerm: string): Observable<Produit[]> {
    const params = new HttpParams().set('motCle', searchTerm);
    return this.http.get<any>(`${this.apiUrl}/recherche`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit[]>(response) || []),
      map(produits => produits.map(p => this.enrichirProduit(p))),
      catchError(error => this.handleError(error, 'recherche des produits'))
    );
  }

  searchProductsDto(searchTerm: string): Observable<ProduitDto[]> {
    const params = new HttpParams().set('motCle', searchTerm);
    return this.http.get<any>(`${this.apiUrl}/recherche/dto`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto[]>(response) || []),
      catchError(error => this.handleError(error, 'recherche des produits (DTO)'))
    );
  }

  getLowStockProducts(): Observable<Produit[]> {
    return this.http.get<any>(`${this.apiUrl}/stock-faible`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit[]>(response) || []),
      map(produits => produits.map(p => this.enrichirProduit(p))),
      catchError(error => this.handleError(error, 'produits en stock faible'))
    );
  }

  getLowStockProductsDto(): Observable<ProduitDto[]> {
    return this.http.get<any>(`${this.apiUrl}/stock-faible/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto[]>(response) || []),
      catchError(error => this.handleError(error, 'produits en stock faible (DTO)'))
    );
  }

  getExpiredProducts(): Observable<Produit[]> {
    return this.http.get<any>(`${this.apiUrl}/perimes`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit[]>(response) || []),
      map(produits => produits.map(p => this.enrichirProduit(p))),
      catchError(error => this.handleError(error, 'produits périmés'))
    );
  }

  getExpiredProductsDto(): Observable<ProduitDto[]> {
    return this.http.get<any>(`${this.apiUrl}/perimes/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto[]>(response) || []),
      catchError(error => this.handleError(error, 'produits périmés (DTO)'))
    );
  }

  getNearExpiryProducts(jours: number = 7): Observable<Produit[]> {
    return this.http.get<any>(`${this.apiUrl}/proche-peremption?jours=${jours}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit[]>(response) || []),
      map(produits => produits.map(p => this.enrichirProduit(p))),
      catchError(error => this.handleError(error, 'produits proches péremption'))
    );
  }

  getNearExpiryProductsDto(jours: number = 7): Observable<ProduitDto[]> {
    return this.http.get<any>(`${this.apiUrl}/proche-peremption/dto?jours=${jours}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto[]>(response) || []),
      catchError(error => this.handleError(error, 'produits proches péremption (DTO)'))
    );
  }

  getBioProducts(): Observable<Produit[]> {
    return this.http.get<any>(`${this.apiUrl}/bio`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit[]>(response) || []),
      map(produits => produits.map(p => this.enrichirProduit(p))),
      catchError(error => this.handleError(error, 'produits bio'))
    );
  }

  getBioProductsDto(): Observable<ProduitDto[]> {
    return this.http.get<any>(`${this.apiUrl}/bio/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto[]>(response) || []),
      catchError(error => this.handleError(error, 'produits bio (DTO)'))
    );
  }

  getProductByCodeBarre(codeBarre: string): Observable<Produit> {
    return this.http.get<any>(`${this.apiUrl}/code-barre/${codeBarre}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Produit>(response)),
      map(produit => this.enrichirProduit(produit)),
      catchError(error => this.handleError(error, `produit avec code-barre ${codeBarre}`))
    );
  }

  getProductDtoByCodeBarre(codeBarre: string): Observable<ProduitDto> {
    return this.http.get<any>(`${this.apiUrl}/code-barre/${codeBarre}/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<ProduitDto>(response)),
      catchError(error => this.handleError(error, `produit DTO avec code-barre ${codeBarre}`))
    );
  }

  getStockStatistics(): Observable<StatistiquesStock> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<StatistiquesStock>(response)),
      catchError(error => this.handleError(error, 'statistiques du stock'))
    );
  }

  getAllFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<any>(`${this.apiUrl}/fournisseurs`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response && response.data) {
          return response.data as Fournisseur[];
        }
        if (Array.isArray(response)) {
          return response as Fournisseur[];
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur chargement fournisseurs:', error);
        return of([]);
      })
    );
  }

  getAllFournisseursDto(): Observable<FournisseurDto[]> {
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<FournisseurDto[]>(response) || []),
      catchError(error => this.handleError(error, 'récupération des fournisseurs (DTO)'))
    );
  }

  getFournisseursActifs(): Observable<Fournisseur[]> {
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/actifs`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Fournisseur[]>(response) || []),
      catchError(error => this.handleError(error, 'fournisseurs actifs'))
    );
  }

  getFournisseursActifsDto(): Observable<FournisseurDto[]> {
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/actifs/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<FournisseurDto[]>(response) || []),
      catchError(error => this.handleError(error, 'fournisseurs actifs (DTO)'))
    );
  }

  getFournisseurById(id: number): Observable<Fournisseur> {
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Fournisseur>(response)),
      catchError(error => this.handleError(error, `fournisseur ${id}`))
    );
  }

  getFournisseurDtoById(id: number): Observable<FournisseurDto> {
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/${id}/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<FournisseurDto>(response)),
      catchError(error => this.handleError(error, `fournisseur DTO ${id}`))
    );
  }

  getFournisseurByCode(code: string): Observable<Fournisseur> {
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/code/${code}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Fournisseur>(response)),
      catchError(error => this.handleError(error, `fournisseur avec code ${code}`))
    );
  }

  getFournisseurDtoByCode(code: string): Observable<FournisseurDto> {
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/code/${code}/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<FournisseurDto>(response)),
      catchError(error => this.handleError(error, `fournisseur DTO avec code ${code}`))
    );
  }

  createFournisseur(fournisseurData: FournisseurRequest): Observable<Fournisseur> {
    return this.http.post<any>(`${this.apiUrl}/fournisseurs`, fournisseurData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Fournisseur>(response)),
      catchError(error => this.handleError(error, 'création du fournisseur'))
    );
  }

  createFournisseurDto(fournisseurData: FournisseurRequest): Observable<FournisseurDto> {
    return this.http.post<any>(`${this.apiUrl}/fournisseurs/dto`, fournisseurData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<FournisseurDto>(response)),
      catchError(error => this.handleError(error, 'création du fournisseur (DTO)'))
    );
  }

  updateFournisseur(id: number, fournisseurData: FournisseurRequest): Observable<Fournisseur> {
    return this.http.put<any>(`${this.apiUrl}/fournisseurs/${id}`, fournisseurData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Fournisseur>(response)),
      catchError(error => this.handleError(error, `mise à jour du fournisseur ${id}`))
    );
  }

  updateFournisseurDto(id: number, fournisseurData: FournisseurRequest): Observable<FournisseurDto> {
    return this.http.put<any>(`${this.apiUrl}/fournisseurs/${id}/dto`, fournisseurData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<FournisseurDto>(response)),
      catchError(error => this.handleError(error, `mise à jour du fournisseur ${id} (DTO)`))
    );
  }

  deleteFournisseur(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/fournisseurs/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, `suppression du fournisseur ${id}`))
    );
  }

  searchFournisseurs(searchTerm: string): Observable<Fournisseur[]> {
    const params = new HttpParams().set('motCle', searchTerm);
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/recherche`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Fournisseur[]>(response) || []),
      catchError(error => this.handleError(error, 'recherche des fournisseurs'))
    );
  }

  searchFournisseursDto(searchTerm: string): Observable<FournisseurDto[]> {
    const params = new HttpParams().set('motCle', searchTerm);
    return this.http.get<any>(`${this.apiUrl}/fournisseurs/recherche/dto`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<FournisseurDto[]>(response) || []),
      catchError(error => this.handleError(error, 'recherche des fournisseurs (DTO)'))
    );
  }

  getAllCategories(): Observable<Categorie[]> {
    return this.http.get<any>(`${this.apiUrl}/categories`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Categorie[]>(response) || []),
      catchError(error => this.handleError(error, 'récupération des catégories'))
    );
  }

  getAllCategoriesDto(): Observable<CategorieDto[]> {
    return this.http.get<any>(`${this.apiUrl}/categories/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<CategorieDto[]>(response) || []),
      catchError(error => this.handleError(error, 'récupération des catégories DTO'))
    );
  }

  getCategoryById(id: number): Observable<Categorie> {
    return this.http.get<any>(`${this.apiUrl}/categories/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Categorie>(response)),
      catchError(error => this.handleError(error, `catégorie ${id}`))
    );
  }

  getCategoryDtoById(id: number): Observable<CategorieDto> {
    return this.http.get<any>(`${this.apiUrl}/categories/${id}/dto`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<CategorieDto>(response)),
      catchError(error => this.handleError(error, `catégorie DTO ${id}`))
    );
  }

  createCategory(categoryData: { nom: string; description?: string }): Observable<Categorie> {
    return this.http.post<any>(`${this.apiUrl}/categories`, categoryData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Categorie>(response)),
      catchError(error => this.handleError(error, 'création de la catégorie'))
    );
  }

  createCategoryDto(categoryData: { nom: string; description?: string }): Observable<CategorieDto> {
    return this.http.post<any>(`${this.apiUrl}/categories/dto`, categoryData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<CategorieDto>(response)),
      catchError(error => this.handleError(error, 'création de la catégorie (DTO)'))
    );
  }

  updateCategory(id: number, categoryData: { nom: string; description?: string }): Observable<Categorie> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, categoryData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<Categorie>(response)),
      catchError(error => this.handleError(error, `mise à jour de la catégorie ${id}`))
    );
  }

  updateCategoryDto(id: number, categoryData: { nom: string; description?: string }): Observable<CategorieDto> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}/dto`, categoryData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<CategorieDto>(response)),
      catchError(error => this.handleError(error, `mise à jour de la catégorie ${id} (DTO)`))
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, `suppression de la catégorie ${id}`))
    );
  }

  checkCategoryExists(nom: string): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/categories/existe/${encodeURIComponent(nom)}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => !!response),
      catchError(() => [false])
    );
  }

  importProducts(file: File): Observable<ImportResult> {
    console.log('🔄 Service: Début de l\'importation du fichier:', file.name);
    const token = this.authService.getToken();
    if (!token) {
      console.error('❌ Token non disponible');
      return throwError(() => new Error('Token non disponible. Veuillez vous reconnecter.'));
    }
    const formData = new FormData();
    formData.append('file', file, file.name);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<ImportResult>(`${this.apiUrl}/import`, formData, { headers }).pipe(
      catchError(error => this.handleError(error, 'importation des produits'))
    );
  }

  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'template-produits-alimentaires.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'téléchargement du template'))
    );
  }

  exportProducts(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `produits-alimentaires-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'exportation des produits'))
    );
  }

  exportFournisseurs(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/fournisseurs`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fournisseurs-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      }),
      catchError(error => this.handleError(error, 'exportation des fournisseurs'))
    );
  }

  private enrichirProduit(produit: Produit): Produit {
    const aujourdhui = new Date();
    const peremption = produit.datePeremption ? new Date(produit.datePeremption) : null;
    return {
      ...produit,
      stockFaible: produit.quantite <= produit.seuilAlerte,
      perime: peremption ? peremption < aujourdhui : false,
      prochePeremption: this.estProchePeremption(produit.datePeremption),
      marge: produit.prixVente - produit.prixAchat,
      tauxMarge: produit.prixAchat > 0 ? ((produit.prixVente - produit.prixAchat) / produit.prixAchat) * 100 : 0,
      joursAvantPeremption: this.calculerJoursAvantPeremption(produit.datePeremption)
    };
  }

  private estProchePeremption(datePeremption?: string, joursAlerte: number = 7): boolean {
    if (!datePeremption) return false;
    const aujourdhui = new Date();
    const peremption = new Date(datePeremption);
    const diffTime = peremption.getTime() - aujourdhui.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= joursAlerte;
  }

  private calculerJoursAvantPeremption(datePeremption?: string): number | undefined {
    if (!datePeremption) return undefined;
    const aujourdhui = new Date();
    const peremption = new Date(datePeremption);
    const diffTime = peremption.getTime() - aujourdhui.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getStatutPeremption(produit: Produit): { texte: string; classe: string } {
    if (produit.perime) {
      return { texte: 'Périmé', classe: 'badge bg-danger' };
    }
    if (produit.prochePeremption) {
      return { texte: 'Proche péremption', classe: 'badge bg-warning text-dark' };
    }
    return { texte: 'Valide', classe: 'badge bg-success' };
  }

  getStatutStock(produit: Produit): { texte: string; classe: string } {
    if (produit.quantite <= 0) {
      return { texte: 'Rupture', classe: 'badge bg-danger' };
    }
    if (produit.stockFaible) {
      return { texte: 'Stock faible', classe: 'badge bg-warning text-dark' };
    }
    return { texte: 'Normal', classe: 'badge bg-success' };
  }

  peutEtreVenduACredit(produit: Produit): boolean {
    return produit.quantite > 0;
  }

  estEnRupture(produit: Produit): boolean {
    return produit.quantite <= 0;
  }

  getProduitAlerteMessage(produit: Produit): string {
    if (produit.quantite <= 0) {
      return `⚠️ Rupture de stock`;
    }
    if (produit.quantite <= produit.seuilAlerte) {
      return `⚠️ Stock faible (${produit.quantite} restants)`;
    }
    return '';
  }

  filterLowStockProducts(products: Produit[]): Produit[] {
    return products.filter(p => p.quantite <= p.seuilAlerte);
  }

  filterExpiredProducts(products: Produit[]): Produit[] {
    return products.filter(p => p.perime);
  }

  filterNearExpiryProducts(products: Produit[], jours: number = 7): Produit[] {
    return products.filter(p => p.prochePeremption);
  }

  filterBioProducts(products: Produit[]): Produit[] {
    return products.filter(p => p.bio);
  }

  calculateTotalStockValue(products: Produit[]): number {
    return products.reduce((total, product) => total + (product.quantite * product.prixAchat), 0);
  }

  calculateTotalSellingValue(products: Produit[]): number {
    return products.reduce((total, product) => total + (product.quantite * product.prixVente), 0);
  }

  calculateTotalPotentialProfit(products: Produit[]): number {
    return products.reduce((total, product) => total + (product.quantite * (product.prixVente - product.prixAchat)), 0);
  }

  creerAchat(request: AchatFournisseurRequest): Observable<AchatFournisseur> {
    return this.http.post<any>(`${this.fournisseurAchatApiUrl}/achat`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<AchatFournisseur>(response)),
      catchError(error => this.handleError(error, 'création d\'achat fournisseur'))
    );
  }

  payerFournisseur(request: PaiementFournisseurRequest): Observable<PaiementFournisseur> {
    return this.http.post<any>(`${this.fournisseurAchatApiUrl}/paiement`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<PaiementFournisseur>(response)),
      catchError(error => this.handleError(error, 'paiement fournisseur'))
    );
  }

  getSituationFournisseur(fournisseurId: number): Observable<FournisseurCompteDto> {
    return this.http.get<any>(`${this.fournisseurAchatApiUrl}/situation/${fournisseurId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<FournisseurCompteDto>(response)),
      catchError(error => this.handleError(error, `situation du fournisseur ${fournisseurId}`))
    );
  }

  // ===== MÉTHODE CORRIGÉE POUR getHistoriqueAchats =====
  getHistoriqueAchats(fournisseurId: number): Observable<AchatFournisseur[]> {
    return this.http.get<any>(`${this.fournisseurAchatApiUrl}/achats/${fournisseurId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        console.log('🔍 Réponse getHistoriqueAchats brute:', response);
        
        // Cas 1: { success: true, achats: [...] }
        if (response && response.success && Array.isArray(response.achats)) {
          console.log('📦 Format avec success + achats, taille:', response.achats.length);
          return response.achats;
        }
        
        // Cas 2: { data: [...] }
        if (response && response.data && Array.isArray(response.data)) {
          console.log('📦 Format avec data, taille:', response.data.length);
          return response.data;
        }
        
        // Cas 3: { achats: [...] }
        if (response && response.achats && Array.isArray(response.achats)) {
          console.log('📦 Format avec achats, taille:', response.achats.length);
          return response.achats;
        }
        
        // Cas 4: Directement un tableau
        if (Array.isArray(response)) {
          console.log('📦 Format tableau direct, taille:', response.length);
          return response;
        }
        
        console.warn('⚠️ Format de réponse non reconnu, retour tableau vide');
        return [];
      }),
      catchError(error => {
        console.error('❌ Erreur getHistoriqueAchats:', error);
        return of([]);
      })
    );
  }
  // =====================================================

  getHistoriquePaiements(fournisseurId: number): Observable<PaiementFournisseur[]> {
    return this.http.get<any>(`${this.fournisseurAchatApiUrl}/paiements/${fournisseurId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData<PaiementFournisseur[]>(response) || []),
      catchError(error => this.handleError(error, `historique paiements du fournisseur ${fournisseurId}`))
    );
  }

  getProduitsSimples(): Observable<ProduitSimple[]> {
    return this.http.get<any[]>(`${this.fournisseurAchatApiUrl}/produits-simples`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response as ProduitSimple[]),
      catchError(error => this.handleError(error, 'récupération des produits simplifiés'))
    );
  }

  getResteAPayer(fournisseurId: number): Observable<number> {
    return this.getSituationFournisseur(fournisseurId).pipe(
      map(situation => situation.solde),
      catchError(error => this.handleError(error, `récupération du reste à payer du fournisseur ${fournisseurId}`))
    );
  }

  enregistrerAvanceFournisseur(request: AvanceFournisseurRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/avances-fournisseurs`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'enregistrement avance fournisseur'))
    );
  }

  getSoldeAvanceFournisseur(fournisseurId: number): Observable<number> {
    return this.http.get<any>(`${environment.apiUrl}/avances-fournisseurs/solde/${fournisseurId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res.soldeDisponible || 0),
      catchError(() => of(0))
    );
  }

  getHistoriqueAvancesFournisseur(fournisseurId: number): Observable<AvanceFournisseur[]> {
    return this.http.get<any>(`${environment.apiUrl}/avances-fournisseurs/historique/${fournisseurId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res.historique || []),
      catchError(() => of([]))
    );
  }

  getAllProduitsForDropdown(): Observable<{ id: number; nom: string; prixAchat: number }[]> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        let produits: any[] = [];
        if (response && response.data) {
          produits = response.data;
        } else if (Array.isArray(response)) {
          produits = response;
        } else {
          produits = [];
        }
        return produits.map(p => ({
          id: p.id,
          nom: p.nom,
          prixAchat: p.prixAchat
        }));
      }),
      catchError(error => {
        console.error('Erreur chargement produits pour dropdown:', error);
        return of([]);
      })
    );
  }

  getAchatById(achatId: number): Observable<any> {
    return this.http.get<any>(`${this.fournisseurAchatApiUrl}/achat/${achatId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'détails achat'))
    );
  }

  effectuerRetourAchat(request: RetourAchatRequest): Observable<RetourAchat> {
    return this.http.post<RetourAchat>(`${environment.apiUrl}/retours-achats`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'retour achat fournisseur'))
    );
  }

  getRetoursByAchat(achatId: number): Observable<RetourAchat[]> {
    return this.http.get<RetourAchat[]>(`${environment.apiUrl}/retours-achats/achat/${achatId}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(() => of([])));
  }

  getRetoursByFournisseur(fournisseurId: number): Observable<RetourAchat[]> {
    return this.http.get<RetourAchat[]>(`${environment.apiUrl}/retours-achats/fournisseur/${fournisseurId}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(() => of([])));
  }

  effectuerRetourVente(request: RetourVenteRequest): Observable<RetourVente> {
    return this.http.post<RetourVente>(`${environment.apiUrl}/retours-ventes`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'retour vente'))
    );
  }

  getRetoursByVente(venteId: number): Observable<RetourVente[]> {
    return this.http.get<RetourVente[]>(`${environment.apiUrl}/retours-ventes/vente/${venteId}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(() => of([])));
  }

  annulerAchatFournisseur(achatId: number, utilisateurId?: number): Observable<any> {
    let url = `${this.fournisseurAchatApiUrl}/achat/${achatId}/annuler`;
    if (utilisateurId) url += `?utilisateurId=${utilisateurId}`;
    return this.http.post<any>(url, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'annulation de l\'achat fournisseur'))
    );
  }
}