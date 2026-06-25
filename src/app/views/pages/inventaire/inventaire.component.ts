// inventaire.component.ts - Version corrigée sans l'erreur de conversion
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../shared/services/websocket.service';
import Swal from 'sweetalert2';
import { InventaireService, MouvementStock, ProduitStock, StatistiquesInventaire, TypeMouvement, MouvementRequest, AjustementRequest } from '../../../shared/services/inventaire.service';
import { ProductService, Produit, Categorie } from '../../../shared/services/product.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ProduitNiveau, ProduitNiveauService } from '../../../shared/services/produit-niveau.service';
import * as XLSX from 'xlsx';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-inventaire',
  templateUrl: './inventaire.component.html',
  styleUrls: ['./inventaire.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule]
})
export class InventaireComponent implements OnInit {
  // Données
  produits: Produit[] = [];
  categories: Categorie[] = [];
  produitsStockFaible: ProduitStock[] = [];
  produitsStockFaibleFiltres: ProduitStock[] = [];
  mouvements: MouvementStock[] = [];
  mouvementsFiltres: MouvementStock[] = [];
  statistiques: StatistiquesInventaire | null = null;
  
  // Filtres pour mouvements
  selectedProduitId: number | null = null;
  selectedProduitNom: string = '';
  typeMouvementFilter: TypeMouvement | null = null;
  dateDebut: string = '';
  dateFin: string = '';
  searchTerm: string = '';
  categorieMouvementFilter: number | null = null;
  
  // Pagination pour mouvements
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Pagination pour produits stock faible
  currentPageStockFaible: number = 1;
  itemsPerPageStockFaible: number = 5;
  
  // États
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Pour les modales
  showEntreeModal: boolean = false;
  showSortieModal: boolean = false;
  showAjustementModal: boolean = false;
  showHistoriqueModal: boolean = false;
  showDetailsModal: boolean = false;
  showExportModal: boolean = false;
  
  // Formulaires
  entreeForm: MouvementRequest = {
    produitId: 0,
    quantite: 1,
    motif: ''
  };
  
  sortieForm: MouvementRequest = {
    produitId: 0,
    quantite: 1,
    motif: ''
  };
  
  ajustementForm: AjustementRequest = {
    produitId: 0,
    nouvelleQuantite: 0,
    motif: ''
  };
  
  selectedProduit: Produit | null = null;
  produitHistorique: MouvementStock[] = [];
  
  // Produit pour détails
  produitDetails: ProduitStock | null = null;
  
  // Export
  exportPeriode: 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalise' = 'jour';
  exportDateDebut: string = '';
  exportDateFin: string = '';
  
  // Recherche dans les modales
  rechercheProduitEntree: string = '';
  rechercheProduitSortie: string = '';
  rechercheProduitAjustement: string = '';
  produitsFiltresEntree: Produit[] = [];
  produitsFiltresSortie: Produit[] = [];
  produitsFiltresAjustement: Produit[] = [];
  
  // Filtre catégorie dans les modales
  categorieEntreeFilter: number | null = null;
  categorieSortieFilter: number | null = null;
  categorieAjustementFilter: number | null = null;
  
  // Map pour retrouver rapidement un produit par son nom
  produitsParNom: Map<string, Produit> = new Map();
  
  // Déclaration pour le template
  TypeMouvement = TypeMouvement;

  // Niveaux conditionnement
  niveauxMap: { [produitId: number]: ProduitNiveau[] } = {};
  niveauxLoadingMap: { [produitId: number]: boolean } = {};
  expandedProduitId: number | null = null;
  searchNiveaux: string = '';
  showNiveauxSection: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private inventaireService: InventaireService,
    private productService: ProductService,
    private authService: AuthService,
    private ws: WebSocketService,
    private niveauService: ProduitNiveauService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initExportDates();
    this.loadCategories();

    // Temps réel : mettre à jour seulement la quantité du produit concerné
    const wsSub = this.ws.subscribeTopic('/topic/stock').subscribe(event => {
      if (event?.data?.produitId != null && event?.data?.quantite != null) {
        const id = event.data.produitId;
        const qty = event.data.quantite;
        this.produits = this.produits.map(p => p.id === id ? { ...p, quantite: qty } : p);
        this.produitsStockFaible = this.produitsStockFaible
          .map(p => p.id === id ? { ...p, quantite: qty } : p)
          .filter(p => p.quantite <= p.seuilAlerte);
        this.produitsStockFaibleFiltres = this.produitsStockFaibleFiltres
          .map(p => p.id === id ? { ...p, quantite: qty } : p)
          .filter(p => p.quantite <= p.seuilAlerte);
      }
    });
    this.subscriptions.push(wsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initExportDates(): void {
    const today = new Date();
    this.exportDateFin = this.formatDateForInput(today);
    this.exportDateDebut = this.formatDateForInput(today);
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
      }
    });
  }

  /**
   * Charger les données initiales
   */
  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Charger tous les produits
    this.productService.getProducts().subscribe({
      next: (produits) => {
        this.produits = produits;
        
        // Construire la map produit par nom
        this.produitsParNom.clear();
        this.produits.forEach(p => {
          this.produitsParNom.set(p.nom, p);
        });
        
        this.filtrerProduitsPourModales();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });

    // Charger les produits en stock faible
    this.loadProduitsStockFaible();

    // Charger les statistiques
    this.loadStatistiques();

    // Charger tous les mouvements récents
    this.loadTousMouvements();
  }

  /**
   * Filtrer les produits pour les modales
   */
  filtrerProduitsPourModales(): void {
    // Filtre pour entrée
    this.produitsFiltresEntree = this.filtrerProduitsParRechercheEtCategorie(
      this.rechercheProduitEntree, 
      this.categorieEntreeFilter
    );
    
    // Filtre pour sortie
    this.produitsFiltresSortie = this.filtrerProduitsParRechercheEtCategorie(
      this.rechercheProduitSortie, 
      this.categorieSortieFilter
    );
    
    // Filtre pour ajustement
    this.produitsFiltresAjustement = this.filtrerProduitsParRechercheEtCategorie(
      this.rechercheProduitAjustement, 
      this.categorieAjustementFilter
    );
  }

  /**
   * Filtrer les produits par recherche textuelle et catégorie
   */
  private filtrerProduitsParRechercheEtCategorie(recherche: string, categorieId: number | null): Produit[] {
    let resultats = [...this.produits];
    
    // Filtre par catégorie
    if (categorieId !== null && categorieId > 0) {
      resultats = resultats.filter(p => p.categorie?.id === categorieId);
    }
    
    // Filtre par recherche textuelle
    if (recherche && recherche.trim()) {
      const terme = recherche.toLowerCase().trim();
      resultats = resultats.filter(p => 
        p.nom.toLowerCase().includes(terme) ||
        (p.codeBarre && p.codeBarre.toLowerCase().includes(terme)) ||
        (p.categorie?.nom && p.categorie.nom.toLowerCase().includes(terme))
      );
    }
    
    // Limiter à 20 résultats pour ne pas surcharger l'affichage
    return resultats.slice(0, 20);
  }

  /**
   * Mettre à jour la recherche pour la modale d'entrée
   */
  onRechercheProduitEntreeChange(): void {
    this.entreeForm.produitId = 0;
    this.filtrerProduitsPourModales();
  }

  onRechercheProduitSortieChange(): void {
    this.sortieForm.produitId = 0;
    this.filtrerProduitsPourModales();
  }

  onRechercheProduitAjustementChange(): void {
    this.ajustementForm.produitId = 0;
    this.selectedProduit = null;
    this.filtrerProduitsPourModales();
  }

  /**
   * Sélectionner un produit dans la modale d'entrée
   */
  selectionnerProduitEntree(produit: Produit): void {
    this.entreeForm.produitId = produit.id;
    this.rechercheProduitEntree = produit.nom;
    this.produitsFiltresEntree = [];
    this.categorieEntreeFilter = null;
  }

  /**
   * Sélectionner un produit dans la modale de sortie
   */
  selectionnerProduitSortie(produit: Produit): void {
    this.sortieForm.produitId = produit.id;
    this.rechercheProduitSortie = produit.nom;
    this.produitsFiltresSortie = [];
    this.categorieSortieFilter = null;
  }

  /**
   * Sélectionner un produit dans la modale d'ajustement
   */
  selectionnerProduitAjustement(produit: Produit): void {
    this.ajustementForm.produitId = produit.id;
    this.rechercheProduitAjustement = produit.nom;
    this.ajustementForm.nouvelleQuantite = produit.quantite;
    this.selectedProduit = produit;
    this.produitsFiltresAjustement = [];
    this.categorieAjustementFilter = null;
  }

  /**
   * Charger tous les mouvements (sans filtre de date)
   */
  loadTousMouvements(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.inventaireService.obtenirTousMouvements().subscribe({
      next: (mouvements) => {
        this.mouvements = mouvements;
        this.appliquerFiltres();
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement mouvements:', err);
        this.chargerParPeriode('mois');
      }
    });
  }

  /**
   * Charger les mouvements du jour
   */
  loadMouvementsJour(): void {
    const today = new Date();
    this.dateDebut = this.formatDateForInput(today);
    this.dateFin = this.formatDateForInput(today);
    this.rechercherMouvements();
  }

  /**
   * Charger les produits en stock faible
   */
  loadProduitsStockFaible(): void {
    this.inventaireService.obtenirProduitsStockFaible().subscribe({
      next: (produits) => {
        this.produitsStockFaible = produits;
        this.produitsStockFaibleFiltres = [...produits];
        this.currentPageStockFaible = 1;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits en stock faible:', error);
      }
    });
  }

  /**
   * Charger les statistiques
   */
  loadStatistiques(): void {
    this.inventaireService.obtenirStatistiquesInventaire().subscribe({
      next: (stats) => {
        this.statistiques = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  /**
   * Rechercher les mouvements
   */
  rechercherMouvements(): void {
    if (!this.dateDebut || !this.dateFin) {
      this.errorMessage = 'Veuillez sélectionner une période';
      return;
    }

    this.isLoading = true;

    const debutISO = this.dateDebut + 'T00:00:00';
    const finISO = this.dateFin + 'T23:59:59';

    this.inventaireService.obtenirMouvementsParDate(debutISO, finISO).subscribe({
      next: (mouvements) => {
        this.mouvements = mouvements;
        this.appliquerFiltres();
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Appliquer tous les filtres sur les mouvements
   */
  appliquerFiltres(): void {
    let filtered = [...this.mouvements];

    // Filtrer par produit (par nom)
    if (this.selectedProduitId) {
      const produit = this.produits.find(p => p.id === this.selectedProduitId);
      if (produit) {
        this.selectedProduitNom = produit.nom;
        filtered = filtered.filter(m => m.produit?.nom === produit.nom);
      }
    } else {
      this.selectedProduitNom = '';
    }

    // Filtrer par catégorie
    if (this.categorieMouvementFilter !== null && this.categorieMouvementFilter > 0) {
      // Récupérer tous les noms des produits de cette catégorie
      const produitsDeCetteCategorie = this.produits.filter(p => p.categorie?.id === this.categorieMouvementFilter);
      const nomsProduits = produitsDeCetteCategorie.map(p => p.nom);
      filtered = filtered.filter(m => m.produit?.nom && nomsProduits.includes(m.produit.nom));
    }

    // Filtrer par type
    if (this.typeMouvementFilter) {
      filtered = filtered.filter(m => m.typeMouvement === this.typeMouvementFilter);
    }

    // Filtrer par recherche textuelle
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(m =>
        (m.produit?.nom || '').toLowerCase().includes(term) ||
        (m.motif || '').toLowerCase().includes(term) ||
        (m.utilisateur?.nomComplet || '').toLowerCase().includes(term)
      );
    }

    this.mouvementsFiltres = filtered;
    this.currentPage = 1;
  }

  /**
   * Appliquer les filtres après changement
   */
  onFilterChange(): void {
    this.appliquerFiltres();
  }

  /**
   * Réinitialiser tous les filtres
   */
  resetFilters(): void {
    this.selectedProduitId = null;
    this.selectedProduitNom = '';
    this.categorieMouvementFilter = null;
    this.typeMouvementFilter = null;
    this.searchTerm = '';
    this.currentPage = 1;
    this.appliquerFiltres();
  }

  /**
   * Formater une date correctement quel que soit le format reçu
   */
  formatDateSafely(dateValue: any): string {
    if (!dateValue) return '';
    
    try {
      if (typeof dateValue === 'string') {
        if (dateValue.includes('T')) {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
        
        if (dateValue.includes(' ') && dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
          const [datePart, timePart] = dateValue.split(' ');
          const [year, month, day] = datePart.split('-');
          const [hour, minute] = timePart.split(':');
          const formattedDate = new Date(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day),
            parseInt(hour) || 0,
            parseInt(minute) || 0
          );
          if (!isNaN(formattedDate.getTime())) {
            return formattedDate.toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
        
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateValue.split('-');
          return `${day}/${month}/${year}`;
        }
      }
      
      if (dateValue instanceof Date) {
        if (!isNaN(dateValue.getTime())) {
          return dateValue.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
      
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return dateValue.toString();
    } catch (error) {
      console.error('Erreur formatage date:', dateValue, error);
      return dateValue ? dateValue.toString() : '';
    }
  }

  /**
   * Formater une date pour input
   */
  private formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ==================== ACTIONS AVEC CONFIRMATION ====================

  enregistrerEntree(): void {
    if (!this.entreeForm.produitId || this.entreeForm.produitId === 0) {
      Swal.fire('Erreur', 'Veuillez sélectionner un produit', 'error');
      return;
    }

    if (!this.entreeForm.quantite || this.entreeForm.quantite <= 0) {
      Swal.fire('Erreur', 'La quantité doit être supérieure à 0', 'error');
      return;
    }

    if (!this.entreeForm.motif || !this.entreeForm.motif.trim()) {
      Swal.fire('Erreur', 'Veuillez saisir un motif', 'error');
      return;
    }

    const produit = this.produits.find(p => p.id === this.entreeForm.produitId);
    
    Swal.fire({
      title: 'Confirmation',
      html: `Voulez-vous enregistrer cette entrée de stock ?<br><br>
             <strong>Produit :</strong> ${produit?.nom}<br>
             <strong>Quantité :</strong> ${this.entreeForm.quantite} unités<br>
             <strong>Motif :</strong> ${this.entreeForm.motif}<br>
             <strong>Nouveau stock :</strong> ${(produit?.quantite || 0) + this.entreeForm.quantite} unités`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.inventaireService.entreeStock(this.entreeForm).subscribe({
          next: () => {
            this.showEntreeModal = false;
            this.loadData();
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Entrée enregistrée',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.isLoading = false;
            Swal.fire('Erreur', error.message, 'error');
          }
        });
      }
    });
  }

  enregistrerSortie(): void {
    if (!this.sortieForm.produitId || this.sortieForm.produitId === 0) {
      Swal.fire('Erreur', 'Veuillez sélectionner un produit', 'error');
      return;
    }

    if (!this.sortieForm.quantite || this.sortieForm.quantite <= 0) {
      Swal.fire('Erreur', 'La quantité doit être supérieure à 0', 'error');
      return;
    }

    if (!this.sortieForm.motif || !this.sortieForm.motif.trim()) {
      Swal.fire('Erreur', 'Veuillez saisir un motif', 'error');
      return;
    }

    const produit = this.produits.find(p => p.id === this.sortieForm.produitId);
    if (produit && produit.quantite < this.sortieForm.quantite) {
      Swal.fire('Erreur', `Stock insuffisant. Disponible: ${produit.quantite}, Demandé: ${this.sortieForm.quantite}`, 'error');
      return;
    }

    Swal.fire({
      title: 'Confirmation',
      html: `Voulez-vous enregistrer cette sortie de stock ?<br><br>
             <strong>Produit :</strong> ${produit?.nom}<br>
             <strong>Quantité :</strong> ${this.sortieForm.quantite} unités<br>
             <strong>Motif :</strong> ${this.sortieForm.motif}<br>
             <strong>Nouveau stock :</strong> ${(produit?.quantite || 0) - this.sortieForm.quantite} unités`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.inventaireService.sortieStock(this.sortieForm).subscribe({
          next: () => {
            this.showSortieModal = false;
            this.loadData();
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Sortie enregistrée',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.isLoading = false;
            Swal.fire('Erreur', error.message, 'error');
          }
        });
      }
    });
  }

  ajusterStock(): void {
    if (!this.ajustementForm.produitId || this.ajustementForm.produitId === 0) {
      Swal.fire('Erreur', 'Veuillez sélectionner un produit', 'error');
      return;
    }

    if (this.ajustementForm.nouvelleQuantite < 0) {
      Swal.fire('Erreur', 'La quantité ne peut pas être négative', 'error');
      return;
    }

    if (!this.ajustementForm.motif || !this.ajustementForm.motif.trim()) {
      Swal.fire('Erreur', 'Veuillez saisir un motif', 'error');
      return;
    }

    const produit = this.produits.find(p => p.id === this.ajustementForm.produitId);
    const variation = this.ajustementForm.nouvelleQuantite - (produit?.quantite || 0);
    const typeVariation = variation > 0 ? 'augmentation' : variation < 0 ? 'diminution' : 'aucun changement';

    Swal.fire({
      title: 'Confirmation',
      html: `Voulez-vous ajuster le stock ?<br><br>
             <strong>Produit :</strong> ${produit?.nom}<br>
             <strong>Stock actuel :</strong> ${produit?.quantite} unités<br>
             <strong>Nouveau stock :</strong> ${this.ajustementForm.nouvelleQuantite} unités<br>
             <strong>Variation :</strong> ${variation > 0 ? '+' : ''}${variation} unités (${typeVariation})<br>
             <strong>Motif :</strong> ${this.ajustementForm.motif}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, ajuster',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.inventaireService.ajusterStock(this.ajustementForm).subscribe({
          next: () => {
            this.showAjustementModal = false;
            this.loadData();
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Stock ajusté',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.isLoading = false;
            Swal.fire('Erreur', error.message, 'error');
          }
        });
      }
    });
  }

  // ==================== EXPORTATIONS ====================

  openExportModal(): void {
    this.initExportDates();
    this.showExportModal = true;
  }

  exporterMouvements(): void {
    let dateDebutEx = '';
    let dateFinEx = '';
    let periodeLabel = '';

    const today = new Date();
    
    switch (this.exportPeriode) {
      case 'jour':
        dateDebutEx = this.formatDateForInput(today);
        dateFinEx = this.formatDateForInput(today);
        periodeLabel = 'du_jour';
        break;
      case 'semaine':
        const debutSemaine = new Date(today);
        debutSemaine.setDate(today.getDate() - today.getDay());
        const finSemaine = new Date(debutSemaine);
        finSemaine.setDate(debutSemaine.getDate() + 6);
        dateDebutEx = this.formatDateForInput(debutSemaine);
        dateFinEx = this.formatDateForInput(finSemaine);
        periodeLabel = 'de_la_semaine';
        break;
      case 'mois':
        dateDebutEx = this.formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1));
        dateFinEx = this.formatDateForInput(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        periodeLabel = 'du_mois';
        break;
      case 'annee':
        dateDebutEx = this.formatDateForInput(new Date(today.getFullYear(), 0, 1));
        dateFinEx = this.formatDateForInput(new Date(today.getFullYear(), 11, 31));
        periodeLabel = 'de_l_annee';
        break;
      case 'personnalise':
        if (!this.exportDateDebut || !this.exportDateFin) {
          Swal.fire('Erreur', 'Veuillez sélectionner une période', 'error');
          return;
        }
        dateDebutEx = this.exportDateDebut;
        dateFinEx = this.exportDateFin;
        periodeLabel = `du_${dateDebutEx}_au_${dateFinEx}`;
        break;
    }

    Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous exporter les mouvements ${periodeLabel.replace(/_/g, ' ')} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, exporter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        const debutISO = new Date(dateDebutEx).toISOString();
        const finISO = new Date(dateFinEx + 'T23:59:59').toISOString();

        this.inventaireService.obtenirMouvementsParDate(debutISO, finISO).subscribe({
          next: (mouvements) => {
            this.isLoading = false;
            this.showExportModal = false;
            
            if (mouvements.length === 0) {
              Swal.fire('Info', 'Aucun mouvement à exporter pour cette période', 'info');
              return;
            }
            
            this.telechargerExcel(mouvements, `mouvements_${periodeLabel}`);
          },
          error: (error) => {
            this.isLoading = false;
            Swal.fire('Erreur', error.message, 'error');
          }
        });
      }
    });
  }

  telechargerExcel(mouvements: MouvementStock[], nomFichier: string): void {
    const data = mouvements.map(m => {
      // Trouver la catégorie du produit à partir du nom
      const produitComplet = this.produitsParNom.get(m.produit?.nom || '');
      return {
        'Date': this.formatDateSafely(m.dateMouvement),
        'Produit': m.produit?.nom || 'N/A',
        'Catégorie': produitComplet?.categorie?.nom || 'N/A',
        'Type': this.getTypeMouvementLabel(m.typeMouvement),
        'Quantité': m.quantite,
        'Stock Avant': m.quantiteAvant,
        'Stock Après': m.quantiteApres,
        'Variation': this.getVariation(m),
        'Utilisateur': m.utilisateur?.nomComplet || 'Système',
        'Motif': m.motif
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mouvements');
    
    XLSX.writeFile(wb, `${nomFichier}.xlsx`);
    
    Swal.fire({
      icon: 'success',
      title: 'Export réussi',
      text: `${mouvements.length} mouvements exportés`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  // ==================== MODALES ====================

  openEntreeModal(produit?: Produit): void {
    this.rechercheProduitEntree = produit ? produit.nom : '';
    this.categorieEntreeFilter = null;
    this.entreeForm = {
      produitId: produit ? produit.id : 0,
      quantite: 1,
      motif: produit ? `Réapprovisionnement - ${produit.nom}` : '',
      dateMouvement: this.getCurrentDateTimeLocal()
    };
    this.filtrerProduitsPourModales();
    this.showEntreeModal = true;
  }

  openSortieModal(produit?: Produit): void {
    this.rechercheProduitSortie = produit ? produit.nom : '';
    this.categorieSortieFilter = null;
    this.sortieForm = { 
      produitId: produit ? produit.id : 0, 
      quantite: 1, 
      motif: '',
      dateMouvement: this.getCurrentDateTimeLocal()
    };
    this.filtrerProduitsPourModales();
    this.showSortieModal = true;
  }

  openAjustementModal(produit?: Produit): void {
    if (produit) {
      this.rechercheProduitAjustement = produit.nom;
      this.categorieAjustementFilter = null;
      this.ajustementForm = { 
        produitId: produit.id, 
        nouvelleQuantite: produit.quantite, 
        motif: '' 
      };
      this.selectedProduit = produit;
    } else {
      this.rechercheProduitAjustement = '';
      this.categorieAjustementFilter = null;
      this.ajustementForm = { 
        produitId: 0, 
        nouvelleQuantite: 0, 
        motif: '' 
      };
      this.selectedProduit = null;
    }
    this.filtrerProduitsPourModales();
    this.showAjustementModal = true;
  }

  private getCurrentDateTimeLocal(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  openHistoriqueModal(produit: any): void {
    // Récupérer le produit complet (avec quantite, seuilAlerte) depuis la liste locale
    const fullProduit = this.produits.find(p => p.id === produit.id) || produit;
    this.selectedProduit = fullProduit;
    this.isLoading = true;

    this.inventaireService.obtenirHistoriqueProduit(produit.id).subscribe({
      next: (historique) => {
        this.produitHistorique = historique;
        this.showHistoriqueModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        Swal.fire('Erreur', error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  closeAllModals(): void {
    this.showEntreeModal = false;
    this.showSortieModal = false;
    this.showAjustementModal = false;
    this.showHistoriqueModal = false;
    this.showDetailsModal = false;
    this.showExportModal = false;
    this.produitsFiltresEntree = [];
    this.produitsFiltresSortie = [];
    this.produitsFiltresAjustement = [];
    this.rechercheProduitEntree = '';
    this.rechercheProduitSortie = '';
    this.rechercheProduitAjustement = '';
    this.categorieEntreeFilter = null;
    this.categorieSortieFilter = null;
    this.categorieAjustementFilter = null;
  }

  // ==================== PAGINATION POUR MOUVEMENTS ====================

  get paginatedMouvements(): MouvementStock[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.mouvementsFiltres.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.mouvementsFiltres.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const maxPagesToShow = 5;
    const pages: number[] = [];
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(total, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ==================== PAGINATION POUR PRODUITS STOCK FAIBLE ====================

  get paginatedProduitsStockFaible(): ProduitStock[] {
    const startIndex = (this.currentPageStockFaible - 1) * this.itemsPerPageStockFaible;
    return this.produitsStockFaibleFiltres.slice(startIndex, startIndex + this.itemsPerPageStockFaible);
  }

  get totalPagesStockFaible(): number {
    return Math.ceil(this.produitsStockFaibleFiltres.length / this.itemsPerPageStockFaible);
  }

  get pageNumbersStockFaible(): number[] {
    const total = this.totalPagesStockFaible;
    const maxPagesToShow = 3;
    const pages: number[] = [];
    
    if (total <= maxPagesToShow) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPageStockFaible - 1);
      let endPage = Math.min(total, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  changePageStockFaible(page: number): void {
    if (page >= 1 && page <= this.totalPagesStockFaible) {
      this.currentPageStockFaible = page;
    }
  }

  // ==================== UTILITAIRES ====================

  /**
   * Obtenir le nom d'un produit par son ID
   */
  getProduitNom(produitId: number): string {
    const produit = this.produits.find(p => p.id === produitId);
    return produit ? produit.nom : 'Produit inconnu';
  }

  /**
   * Obtenir le stock d'un produit par son ID
   */
  getProduitStock(produitId: number): number {
    const produit = this.produits.find(p => p.id === produitId);
    return produit ? produit.quantite : 0;
  }

  /**
   * Obtenir la catégorie d'un mouvement
   */
  getProduitCategorie(mouvement: MouvementStock): string {
    const produit = this.produitsParNom.get(mouvement.produit?.nom || '');
    return produit?.categorie?.nom || 'N/A';
  }

  formatPrice(price: number): string {
    return this.inventaireService.formatPrice(price);
  }

  getTypeMouvementLabel(type: TypeMouvement): string {
    return this.inventaireService.getTypeMouvementLabel(type);
  }

  getTypeMouvementClass(type: TypeMouvement): string {
    return this.inventaireService.getTypeMouvementClass(type);
  }

  getStockStatusClass(quantite: number, seuil: number): string {
    return this.inventaireService.getStockStatusClass(quantite, seuil);
  }

  getStockStatusText(quantite: number, seuil: number): string {
    return this.inventaireService.getStockStatusText(quantite, seuil);
  }

  getVariation(mouvement: MouvementStock): string {
    const variation = mouvement.quantiteApres - mouvement.quantiteAvant;
    return variation > 0 ? `+${variation}` : variation.toString();
  }

  getVariationClass(mouvement: MouvementStock): string {
    const variation = mouvement.quantiteApres - mouvement.quantiteAvant;
    return variation > 0 ? 'text-success' : variation < 0 ? 'text-danger' : 'text-muted';
  }

  getTypeMouvementOptions(): TypeMouvement[] {
    return [TypeMouvement.ENTREE, TypeMouvement.SORTIE, TypeMouvement.AJUSTEMENT, TypeMouvement.RETOUR];
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  chargerParPeriode(periode: 'jour' | 'semaine' | 'mois' | 'annee'): void {
    const today = new Date();
    let debut: Date;
    
    switch (periode) {
      case 'jour':
        debut = today;
        break;
      case 'semaine':
        debut = new Date(today);
        debut.setDate(today.getDate() - today.getDay());
        break;
      case 'mois':
        debut = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'annee':
        debut = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        debut = today;
    }
    
    this.dateDebut = this.formatDateForInput(debut);
    this.dateFin = this.formatDateForInput(today);
    this.rechercherMouvements();
  }

  /**
   * Mettre à jour le produit sélectionné pour le filtre
   */
  onProduitChange(): void {
    if (this.selectedProduitId) {
      const produit = this.produits.find(p => p.id === this.selectedProduitId);
      this.selectedProduitNom = produit ? produit.nom : '';
    } else {
      this.selectedProduitNom = '';
    }
    this.appliquerFiltres();
  }

  // ─── Niveaux conditionnement ──────────────────────────────────────────────

  get produitsFiltresNiveaux(): Produit[] {
    const term = this.searchNiveaux.toLowerCase().trim();
    if (!term) return this.produits;
    return this.produits.filter(p => p.nom.toLowerCase().includes(term));
  }

  toggleNiveaux(produit: Produit): void {
    if (this.expandedProduitId === produit.id) {
      this.expandedProduitId = null;
      return;
    }
    this.expandedProduitId = produit.id;
    if (!this.niveauxMap[produit.id]) {
      this.niveauxLoadingMap[produit.id] = true;
      this.niveauService.getNiveaux(produit.id).subscribe({
        next: niveaux => {
          this.niveauxMap[produit.id] = niveaux;
          this.niveauxLoadingMap[produit.id] = false;
        },
        error: () => { this.niveauxLoadingMap[produit.id] = false; }
      });
    }
  }

  decomposerNiveau(niveau: ProduitNiveau, produit: Produit): void {
    this.niveauService.decomposer(niveau.id!).subscribe({
      next: res => {
        this.niveauxMap[produit.id] = res.niveaux;
        const idx = this.produits.findIndex(p => p.id === produit.id);
        if (idx >= 0) this.produits[idx] = { ...this.produits[idx], quantite: res.produitQuantite };
        Swal.fire({ icon: 'success', title: res.message || 'Décomposition effectuée', timer: 2000, showConfirmButton: false });
      },
      error: e => Swal.fire({ icon: 'error', title: 'Erreur', text: e.message || 'Décomposition impossible' })
    });
  }

  niveauStockClass(n: ProduitNiveau): string {
    const s = n.stock ?? 0;
    if (s === 0) return 'badge bg-danger';
    if (s <= 5) return 'badge bg-warning text-dark';
    return 'badge bg-success';
  }
}