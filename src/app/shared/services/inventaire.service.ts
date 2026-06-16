  import { Injectable } from '@angular/core';
  import { HttpClient, HttpParams } from '@angular/common/http';
  import { Observable, throwError } from 'rxjs';
  import { catchError, map } from 'rxjs/operators';
  import { AuthService } from './auth.service';
  import { environment } from '../../../environments/environment';

  // Interfaces
  export interface MouvementStock {
    id: number;
    produit: {
      id: number;
      nom: string;
      prixAchat: number;
      prixVente: number;
    };
    quantite: number;
    typeMouvement: TypeMouvement;
    quantiteAvant: number;
    quantiteApres: number;
    utilisateur?: {
      id: number;
      nomComplet: string;
      username: string;
    };
    motif: string;
    dateMouvement: string;
  }

  export enum TypeMouvement {
    ENTREE = 'ENTREE',
    SORTIE = 'SORTIE',
    AJUSTEMENT = 'AJUSTEMENT',
    RETOUR = 'RETOUR',
    BONUS_FOURNISSEUR = 'BONUS_FOURNISSEUR'
  }

  export interface ProduitStock {
    id: number;
    nom: string;
    description: string;
    categorie: {
      id: number;
      nom: string;
    };
    prixAchat: number;
    prixVente: number;
    quantite: number;
    seuilAlerte: number;
    codeBarre: string;
    stockFaible?: boolean;
  }

  export interface StatistiquesInventaire {
    produitsStockFaible: number;
    produitsRupture: number;
    valeurTotaleStock: number;
    totalEntrees: number;
    totalSorties: number;
    variationNet: number;
  }

  // Interface pour les requêtes avec date
  export interface MouvementRequest {
    produitId: number;
    quantite: number;
    motif: string;
    utilisateurId?: number;
    dateMouvement?: string; // Date et heure optionnelles
  }

  export interface AjustementRequest {
    produitId: number;
    nouvelleQuantite: number;
    motif: string;
    utilisateurId?: number;
    dateAjustement?: string; // Date et heure optionnelles
  }

  export interface ModificationMouvementRequest {
    quantite: number;
    motif: string;
    dateMouvement: string;
  }

  @Injectable({
    providedIn: 'root'
  })
  export class InventaireService {
    private apiUrl = `${environment.apiUrl}/inventaire`;

    constructor(
      private http: HttpClient,
      private authService: AuthService
    ) { }

    /**
     * Obtenir les headers avec le token JWT
     */
    private getAuthHeaders() {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Token non disponible. Veuillez vous reconnecter.');
      }
      
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }

    /**
     * Obtenir la date et heure actuelles au format ISO
     */
    getCurrentDateTime(): string {
      return new Date().toISOString();
    }

    /**
     * Formater une date pour l'affichage
     */
    formatDateTimeForDisplay(dateString: string): string {
      if (!dateString) return '';
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

    /**
     * Enregistrer une entrée de stock avec date personnalisable
     */
    entreeStock(mouvement: MouvementRequest): Observable<void> {
      const requestData: any = {
        produitId: mouvement.produitId,
        quantite: mouvement.quantite,
        motif: mouvement.motif,
        utilisateurId: mouvement.utilisateurId || this.authService.getUser()?.id
      };

      // Ajouter la date si fournie, sinon le backend utilisera la date actuelle
      if (mouvement.dateMouvement) {
        requestData.dateMouvement = mouvement.dateMouvement;
      }

      console.log('📤 Service: entrée stock appelée');
      console.log('📦 Données envoyées:', requestData);

      return this.http.post<void>(`${this.apiUrl}/entree`, requestData, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          console.error('❌ Erreur lors de l\'entrée de stock:', error);
          let errorMessage = 'Impossible d\'enregistrer l\'entrée de stock';
          
          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.status === 400) {
            errorMessage = 'Données invalides. Vérifiez les informations saisies.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent gérer l\'inventaire.';
          } else if (error.status === 404) {
            errorMessage = 'Produit non trouvé';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Enregistrer une sortie de stock avec date personnalisable
     */
    sortieStock(mouvement: MouvementRequest): Observable<void> {
      const requestData: any = {
        produitId: mouvement.produitId,
        quantite: mouvement.quantite,
        motif: mouvement.motif,
        utilisateurId: mouvement.utilisateurId || this.authService.getUser()?.id
      };

      // Ajouter la date si fournie, sinon le backend utilisera la date actuelle
      if (mouvement.dateMouvement) {
        requestData.dateMouvement = mouvement.dateMouvement;
      }

      console.log('📤 Service: sortie stock appelée');
      console.log('📦 Données envoyées:', requestData);

      return this.http.post<void>(`${this.apiUrl}/sortie`, requestData, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          console.error('❌ Erreur lors de la sortie de stock:', error);
          let errorMessage = 'Impossible d\'enregistrer la sortie de stock';
          
          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.status === 400) {
            errorMessage = 'Données invalides. Vérifiez les informations saisies.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent gérer l\'inventaire.';
          } else if (error.status === 404) {
            errorMessage = 'Produit non trouvé';
          } else if (error.status === 409) {
            errorMessage = 'Stock insuffisant';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Ajuster le stock avec date personnalisable
     */
    ajusterStock(ajustement: AjustementRequest): Observable<void> {
      const requestData: any = {
        produitId: ajustement.produitId,
        nouvelleQuantite: ajustement.nouvelleQuantite,
        motif: ajustement.motif,
        utilisateurId: ajustement.utilisateurId || this.authService.getUser()?.id
      };

      // Ajouter la date si fournie, sinon le backend utilisera la date actuelle
      if (ajustement.dateAjustement) {
        requestData.dateAjustement = ajustement.dateAjustement;
      }

      console.log('📤 Service: ajustement stock appelé');
      console.log('📦 Données envoyées:', requestData);

      return this.http.post<void>(`${this.apiUrl}/ajustement`, requestData, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          console.error('❌ Erreur lors de l\'ajustement de stock:', error);
          let errorMessage = 'Impossible d\'ajuster le stock';
          
          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.status === 400) {
            errorMessage = 'Données invalides. Vérifiez les informations saisies.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent gérer l\'inventaire.';
          } else if (error.status === 404) {
            errorMessage = 'Produit non trouvé';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Modifier un mouvement existant
     */
    modifierMouvement(mouvementId: number, modification: ModificationMouvementRequest): Observable<void> {
      const requestData = {
        quantite: modification.quantite,
        motif: modification.motif,
        dateMouvement: modification.dateMouvement
      };

      console.log('📤 Service: modification mouvement appelée');
      console.log('📦 Données envoyées:', requestData);

      return this.http.put<void>(`${this.apiUrl}/mouvement/${mouvementId}`, requestData, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          console.error('❌ Erreur lors de la modification du mouvement:', error);
          let errorMessage = 'Impossible de modifier le mouvement';
          
          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent modifier les mouvements.';
          } else if (error.status === 404) {
            errorMessage = 'Mouvement non trouvé';
          } else if (error.status === 409) {
            errorMessage = 'La modification est incompatible avec l\'état actuel du stock';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Supprimer un mouvement
     */
    supprimerMouvement(mouvementId: number): Observable<void> {
      console.log('📤 Service: suppression mouvement appelée');
      console.log('📦 ID du mouvement:', mouvementId);

      return this.http.delete<void>(`${this.apiUrl}/mouvement/${mouvementId}`, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          console.error('❌ Erreur lors de la suppression du mouvement:', error);
          let errorMessage = 'Impossible de supprimer le mouvement';
          
          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent supprimer les mouvements.';
          } else if (error.status === 404) {
            errorMessage = 'Mouvement non trouvé';
          } else if (error.status === 409) {
            errorMessage = 'La suppression est incompatible avec l\'état actuel du stock';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Obtenir l'historique d'un produit
     */
    obtenirHistoriqueProduit(produitId: number): Observable<MouvementStock[]> {
      return this.http.get<MouvementStock[]>(`${this.apiUrl}/historique/produit/${produitId}`, {
        headers: this.getAuthHeaders()
      }).pipe(
        map(mouvements => mouvements.map(m => ({
          ...m,
          dateMouvement: this.formatDateForDisplay(m.dateMouvement)
        }))),
        catchError(error => {
          console.error(`Erreur lors de la récupération de l'historique du produit ${produitId}:`, error);
          let errorMessage = `Impossible de récupérer l'historique du produit`;
          
          if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent voir l\'historique.';
          } else if (error.status === 404) {
            errorMessage = 'Produit non trouvé';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Obtenir les mouvements par date
     */
    obtenirTousMouvements(): Observable<MouvementStock[]> {
      return this.http.get<MouvementStock[]>(`${this.apiUrl}/mouvements`, {
        headers: this.getAuthHeaders()
      }).pipe(
        map(mouvements => mouvements.map(m => ({
          ...m,
          dateMouvement: this.formatDateForDisplay(m.dateMouvement)
        }))),
        catchError(error => {
          console.error('Erreur lors de la récupération des mouvements:', error);
          return throwError(() => new Error('Impossible de récupérer les mouvements'));
        })
      );
    }

    obtenirMouvementsParDate(debut: string, fin: string): Observable<MouvementStock[]> {
      const params = new HttpParams()
        .set('debut', debut)
        .set('fin', fin);

      return this.http.get<MouvementStock[]>(`${this.apiUrl}/historique`, {
        params,
        headers: this.getAuthHeaders()
      }).pipe(
        map(mouvements => mouvements.map(m => ({
          ...m,
          dateMouvement: this.formatDateForDisplay(m.dateMouvement)
        }))),
        catchError(error => {
          console.error('Erreur lors de la récupération des mouvements par date:', error);
          let errorMessage = 'Impossible de récupérer les mouvements';
          
          if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent voir les mouvements.';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Obtenir les produits en stock faible
     */
    obtenirProduitsStockFaible(): Observable<ProduitStock[]> {
      return this.http.get<ProduitStock[]>(`${this.apiUrl}/stock-faible`, {
        headers: this.getAuthHeaders()
      }).pipe(
        map(produits => produits.map(p => ({
          ...p,
          stockFaible: p.quantite <= p.seuilAlerte
        }))),
        catchError(error => {
          console.error('Erreur lors de la récupération des produits en stock faible:', error);
          let errorMessage = 'Impossible de récupérer les produits en stock faible';
          
          if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent voir cette information.';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Obtenir les statistiques de l'inventaire
     */
    obtenirStatistiquesInventaire(): Observable<StatistiquesInventaire> {
      return this.http.get<StatistiquesInventaire>(`${this.apiUrl}/statistiques`, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des statistiques:', error);
          let errorMessage = 'Impossible de récupérer les statistiques de l\'inventaire';
          
          if (error.status === 403) {
            errorMessage = 'Accès refusé. Seuls les administrateurs peuvent voir les statistiques.';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }

    /**
     * Formater la date pour l'affichage
     */
    private formatDateForDisplay(dateString: string): string {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    }

    /**
     * Formater le prix
     */
    formatPrice(price: number): string {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    }

    /**
     * Obtenir le libellé du type de mouvement
     */
    getTypeMouvementLabel(type: TypeMouvement): string {
      const labels: Record<TypeMouvement, string> = {
        [TypeMouvement.ENTREE]: 'Entrée',
        [TypeMouvement.SORTIE]: 'Sortie',
        [TypeMouvement.AJUSTEMENT]: 'Ajustement',
        [TypeMouvement.RETOUR]: 'Retour',
        [TypeMouvement.BONUS_FOURNISSEUR]: 'Bonus Fournisseur'
      };
      return labels[type] || type;
    }

    /**
     * Obtenir la classe CSS pour le type de mouvement
     */
    getTypeMouvementClass(type: TypeMouvement): string {
      switch (type) {
        case TypeMouvement.ENTREE:
          return 'badge bg-success text-white';
        case TypeMouvement.SORTIE:
          return 'badge bg-danger text-white';
        case TypeMouvement.AJUSTEMENT:
          return 'badge bg-warning text-dark';
        case TypeMouvement.RETOUR:
          return 'badge bg-info text-white';
        case TypeMouvement.BONUS_FOURNISSEUR:
          return 'badge bg-success text-white';
        default:
          return 'badge bg-secondary text-white';
      }
    }

    /**
     * Obtenir la classe CSS pour le statut du stock
     */
    getStockStatusClass(quantite: number, seuil: number): string {
      if (quantite === 0) return 'bg-danger text-white';
      if (quantite <= seuil) return 'bg-warning text-dark';
      return 'bg-success text-white';
    }

    /**
     * Obtenir le texte du statut du stock
     */
    getStockStatusText(quantite: number, seuil: number): string {
      if (quantite === 0) return 'Rupture';
      if (quantite <= seuil) return 'Faible';
      return 'Normal';
    }

    /**
     * Calculer la valeur du stock d'un produit
     */
    calculerValeurStock(produit: ProduitStock): number {
      return produit.quantite * produit.prixAchat;
    }
  }