// src/app/views/pages/produit/produit.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../shared/services/websocket.service';
import {
  ProductService,
  Produit,
  Categorie,
  StatistiquesStock,
  ProduitRequest,
  ImportResult,
  Fournisseur,
  FournisseurRequest,
  LigneAchatRequest,
  AchatFournisseurRequest,
  PaiementFournisseurRequest,
  FournisseurCompteDto,
  FournisseurRequestWithOptionalId,
  AvanceFournisseurRequest,
  AvanceFournisseur,
  RetourAchatRequest,
  RetourAchat
} from '../../../shared/services/product.service';
import { AuthService } from '../../../shared/services/auth.service';
import { CompteService, Compte } from '../../../shared/services/compte.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ProduitComponent implements OnInit, OnDestroy {
  private wsSubs: Subscription[] = [];
  produits: Produit[] = [];
  tousLesProduits: Produit[] = []; // ✅ AJOUTÉ: Stocke tous les produits pour le filtrage
  categories: Categorie[] = [];
  fournisseurs: Fournisseur[] = [];
  statistiques: StatistiquesStock | null = null;
  soldeRestant: number = 0;
  isLoadingSolde: boolean = false;
  nouveauSolde: number = 0;

  searchTerm: string = '';
  selectedCategoryId: number | null = null;
  selectedFournisseurId: number | null = null;
  selectedStatutPeremption: string = 'all';
  showLowStockOnly: boolean = false;
  showBioOnly: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;

  activeTab: string = 'produits';

  isLoading: boolean = false;
  isImporting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  selectedProduct: Produit | null = null;
  selectedFournisseur: Fournisseur | null = null;
  selectedCategory: Categorie | null = null;

  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDetailsModal: boolean = false;
  showDeleteModal: boolean = false;

  showAddFournisseurModal: boolean = false;
  showEditFournisseurModal: boolean = false;
  showDeleteFournisseurModal: boolean = false;

  showAddCategoryModal: boolean = false;
  isEditingCategory: boolean = false;
  showDeleteCategoryModal: boolean = false;

  showImportModal: boolean = false;
  showImportResultModal: boolean = false;

  selectedFile: File | null = null;
  importResult: ImportResult | null = null;

  productForm: ProduitRequest = {
    nom: '',
    description: '',
    categorieId: 0,
    fournisseurId: null,
    prixAchat: 0,
    prixVente: 0,
    quantite: 0,
    seuilAlerte: 10,
    codeBarre: '',
    dateCreation: new Date().toISOString().split('T')[0],
    datePeremption: null,
    lotNumber: '',
    conditionsStockage: '',
    poidsVolume: null,
    uniteMesure: '',
    bio: false,
    origine: ''
  };

  categoryForm: any = {
    nom: '',
    description: ''
  };

  fournisseurFormData: FournisseurRequest = {
    nom: '',
    code: '',
    adresse: '',
    telephone: '',
    email: '',
    siteWeb: '',
    contactNom: '',
    contactTelephone: '',
    contactEmail: '',
    description: '',
    typeProduits: '',
    conditionsPaiement: '',
    delaiLivraison: null,
    note: null,
    actif: true
  };

  showAchatModal: boolean = false;
  showPaiementModal: boolean = false;
  showSituationModal: boolean = false;
  showAvanceFournisseurModal: boolean = false;
  showHistoriqueAvancesModal: boolean = false;
  showRetourAchatModal: boolean = false;
  selectedAchatPourRetour: any = null;
  retourAchatLignes: { ligneAchatId: number; produitId: number; produitNom: string; prixUnitaire: number; quantiteMax: number; quantiteRetournee: number; selected: boolean }[] = [];
  retourAchatModeRemboursement: 'CAISSE' | 'BANQUE' = 'CAISSE';
  retourAchatCompteId: number | undefined = undefined;
  retourAchatMotif: string = '';
  historiqueRetoursFournisseur: RetourAchat[] = [];
  selectedFournisseurForAchat: Fournisseur | null = null;
  selectedFournisseurForPaiement: Fournisseur | null = null;
  selectedFournisseurForSituation: Fournisseur | null = null;
  selectedFournisseurForAvance: Fournisseur | null = null;
  selectedFournisseurForHistorique: Fournisseur | null = null;
  fournisseurSituation: FournisseurCompteDto | null = null;
  isLoadingSituation: boolean = false;

  avanceFournisseurDisponible: number = 0;
  avanceFournisseurUtilisee: number = 0;
  isLoadingAvance: boolean = false;
  avanceFournisseurForm: AvanceFournisseurRequest = {
    fournisseurId: 0,
    montant: 0,
    motif: '',
    sourceFinancement: 'CAISSE',
    compteId: undefined
  };
  historiqueAvancesFournisseur: AvanceFournisseur[] = [];

  comptes: Compte[] = [];
  isLoadingComptes: boolean = false;

  achatsNonPayes: any[] = [];
  montantMaxPaiement: number = 0;

  achatForm: {
    fournisseurId?: number;
    nouveauFournisseur?: FournisseurRequestWithOptionalId;
    lignes: LigneAchatRequest[];
    montantPaye?: number;
    modePaiementImmediat?: string;
    compteIdPaiement?: number | null;
    commentaire?: string;
  } = {
    lignes: [],
    modePaiementImmediat: 'ESPECES',
    compteIdPaiement: null
  };

  paiementForm: any = {
    fournisseurId: 0,
    montant: 0,
    modePaiement: 'ESPECES',
    reference: '',
    observation: '',
    compteId: undefined,
    achatCibleId: null
  };

  tempLigneAchat: {
    produitId?: number;
    produitNom?: string;
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
  } = {
    quantite: 1,
    prixAchatUnitaire: 0
  };

  categoriesPourNouveauProduit: Categorie[] = [];
  produitsDropdown: { id: number; nom: string; prixAchat: number }[] = [];
  Math = Math;

  modesPaiement = [
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'BANQUE', label: 'Banque' }
  ];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private compteService: CompteService,
    private http: HttpClient,
    private ws: WebSocketService
  ) {}

  ngOnInit(): void {
    this.ws.connect();
    this.loadData();
    const stockSub = this.ws.subscribeTopic('/topic/stock').subscribe(event => {
      if (event?.data?.produitId != null && event?.data?.quantite != null) {
        const id = event.data.produitId;
        const qty = event.data.quantite;
        this.tousLesProduits = this.tousLesProduits.map(p => p.id === id ? { ...p, quantite: qty } : p);
        this.produits = this.produits.map(p => p.id === id ? { ...p, quantite: qty } : p);
      }
    });
    this.wsSubs.push(stockSub);
  }

  ngOnDestroy(): void {
    this.wsSubs.forEach(s => s.unsubscribe());
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts().subscribe({
      next: (produits) => {
        this.tousLesProduits = produits; // ✅ STOCKER TOUS LES PRODUITS
        this.produits = [...this.tousLesProduits]; // ✅ COPIER POUR AFFICHAGE
        this.applyFilters(); // ✅ APPLIQUER LES FILTRES APRÈS CHARGEMENT
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        this.handleAuthError(error);
      }
    });
    this.loadCategories();
    this.loadFournisseurs();
    if (this.authService.isAdmin()) {
      this.loadStatistics();
    }
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoriesPourNouveauProduit = categories;
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
        this.handleAuthError(error);
      }
    });
  }

  loadFournisseurs(): void {
    this.productService.getAllFournisseurs().subscribe({
      next: (fournisseurs) => {
        this.fournisseurs = fournisseurs || [];
        console.log('Fournisseurs chargés:', this.fournisseurs.length);
      },
      error: (error) => {
        console.error('Erreur chargement fournisseurs:', error);
        this.fournisseurs = [];
        this.errorMessage = 'Impossible de charger la liste des fournisseurs.';
      }
    });
  }

  loadStatistics(): void {
    this.productService.getStockStatistics().subscribe({
      next: (stats) => {
        this.statistiques = stats;
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
      }
    });
  }

  // ✅ CORRECTION: La méthode applyFilters filtre maintenant correctement les produits
  applyFilters(): void {
    let filtered = [...this.tousLesProduits];

    // Filtre par catégorie
    if (this.selectedCategoryId !== null && this.selectedCategoryId !== undefined && this.selectedCategoryId > 0) {
      filtered = filtered.filter(p => p.categorie?.id === this.selectedCategoryId);
    }

    // Filtre par fournisseur
    if (this.selectedFournisseurId !== null && this.selectedFournisseurId > 0) {
      filtered = filtered.filter(p => p.fournisseur?.id === this.selectedFournisseurId);
    }

    // Filtre stock faible
    if (this.showLowStockOnly) {
      filtered = filtered.filter(p => p.stockFaible);
    }

    // Filtre bio
    if (this.showBioOnly) {
      filtered = filtered.filter(p => p.bio);
    }

    // Filtre statut péremption
    if (this.selectedStatutPeremption !== 'all') {
      filtered = filtered.filter(p => {
        if (this.selectedStatutPeremption === 'valid') return !p.perime && !p.prochePeremption;
        if (this.selectedStatutPeremption === 'near') return p.prochePeremption;
        if (this.selectedStatutPeremption === 'expired') return p.perime;
        return true;
      });
    }

    // Filtre recherche textuelle
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.codeBarre && p.codeBarre.toLowerCase().includes(term)) ||
        p.categorie.nom.toLowerCase().includes(term) ||
        (p.fournisseur?.nom && p.fournisseur.nom.toLowerCase().includes(term))
      );
    }

    this.produits = filtered;
    this.currentPage = 1;
  }

  // ✅ CORRECTION: searchProducts utilise maintenant l'API de recherche
  searchProducts(): void {
    if (!this.searchTerm.trim()) {
      this.loadData();
      return;
    }
    this.isLoading = true;
    this.productService.searchProducts(this.searchTerm).subscribe({
      next: (produits) => {
        this.tousLesProduits = produits;
        this.produits = [...this.tousLesProduits];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.selectedFournisseurId = null;
    this.selectedStatutPeremption = 'all';
    this.showLowStockOnly = false;
    this.showBioOnly = false;
    this.currentPage = 1;
    this.applyFilters(); // ✅ Appliquer les filtres réinitialisés
  }

  openAddModal(): void {
    this.resetProductForm();
    this.showAddModal = true;
  }

  openEditModal(produit: Produit): void {
    this.selectedProduct = produit;
    this.productForm = {
      nom: produit.nom,
      description: produit.description || '',
      categorieId: produit.categorie.id,
      fournisseurId: produit.fournisseur?.id || null,
      prixAchat: produit.prixAchat,
      prixVente: produit.prixVente,
      quantite: produit.quantite,
      seuilAlerte: produit.seuilAlerte,
      codeBarre: produit.codeBarre || '',
      dateCreation: produit.dateCreation,
      datePeremption: produit.datePeremption,
      lotNumber: produit.lotNumber || '',
      conditionsStockage: produit.conditionsStockage || '',
      poidsVolume: produit.poidsVolume || null,
      uniteMesure: produit.uniteMesure || '',
      bio: produit.bio,
      origine: produit.origine || ''
    };
    this.showEditModal = true;
  }

  openDetailsModal(produit: Produit): void {
    this.selectedProduct = produit;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProduct = null;
  }

  openDeleteModal(produit: Produit): void {
    this.selectedProduct = produit;
    Swal.fire({
      title: '⚠️ Supprimer ce produit ?',
      html: `<b>${produit.nom}</b> sera supprimé définitivement.<br><br>📦 Stock actuel: <strong>${produit.quantite}</strong><br>💰 Prix vente: <strong>${this.formatPrice(produit.prixVente)}</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (result.isConfirmed) this.deleteProduct();
      else this.selectedProduct = null;
    });
  }

  addProduct(): void {
    if (!this.productForm.nom?.trim()) {
      Swal.fire('Erreur', 'Le nom du produit est obligatoire', 'error');
      return;
    }
    if (!this.productForm.categorieId || this.productForm.categorieId === 0) {
      Swal.fire('Erreur', 'Veuillez sélectionner une catégorie', 'error');
      return;
    }
    if (this.productForm.prixAchat <= 0) {
      Swal.fire('Erreur', 'Le prix d\'achat doit être supérieur à 0', 'error');
      return;
    }
    if (this.productForm.prixVente <= this.productForm.prixAchat) {
      Swal.fire('Erreur', 'Le prix de vente doit être supérieur au prix d\'achat', 'error');
      return;
    }
    if (this.productForm.quantite < 0) {
      Swal.fire('Erreur', 'La quantité ne peut pas être négative', 'error');
      return;
    }
    
    Swal.fire({
      title: '✅ Confirmer l\'ajout',
      html: `<div class="text-start">
               <p><strong>Détails du produit :</strong></p>
               <ul>
                 <li>Nom: <strong>${this.productForm.nom}</strong></li>
                 <li>Prix achat: <strong>${this.formatPrice(this.productForm.prixAchat)}</strong></li>
                 <li>Prix vente: <strong>${this.formatPrice(this.productForm.prixVente)}</strong></li>
                 <li>Quantité: <strong>${this.productForm.quantite}</strong></li>
               </ul>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, ajouter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      this.productService.createProduct(this.productForm).subscribe({
        next: (produit) => {
          this.showAddModal = false;
          this.loadData();
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Produit créé', text: `"${produit.nom}" ajouté avec succès`, timer: 2000, timerProgressBar: true, confirmButtonColor: '#198754' });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        }
      });
    });
  }

  updateProduct(): void {
    if (!this.selectedProduct) return;
    if (!this.productForm.nom?.trim()) {
      Swal.fire('Erreur', 'Le nom du produit est obligatoire', 'error');
      return;
    }
    if (!this.productForm.categorieId || this.productForm.categorieId === 0) {
      Swal.fire('Erreur', 'Veuillez sélectionner une catégorie', 'error');
      return;
    }
    if (this.productForm.prixAchat <= 0) {
      Swal.fire('Erreur', 'Le prix d\'achat doit être supérieur à 0', 'error');
      return;
    }
    if (this.productForm.prixVente <= this.productForm.prixAchat) {
      Swal.fire('Erreur', 'Le prix de vente doit être supérieur au prix d\'achat', 'error');
      return;
    }
    if (this.productForm.quantite < 0) {
      Swal.fire('Erreur', 'La quantité ne peut pas être négative', 'error');
      return;
    }
    
    Swal.fire({
      title: '✏️ Confirmer la modification',
      html: `<div class="text-start">
               <p><strong>Produit :</strong> ${this.selectedProduct.nom}</p>
               <ul>
                 <li>Prix achat: <strong>${this.formatPrice(this.productForm.prixAchat)}</strong></li>
                 <li>Prix vente: <strong>${this.formatPrice(this.productForm.prixVente)}</strong></li>
                 <li>Quantité: <strong>${this.productForm.quantite}</strong></li>
               </ul>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      this.productService.updateProduct(this.selectedProduct.id, this.productForm).subscribe({
        next: (produit) => {
          this.showEditModal = false;
          this.selectedProduct = null;
          this.loadData();
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Produit modifié', text: `"${produit.nom}" mis à jour`, timer: 2000, timerProgressBar: true, confirmButtonColor: '#198754' });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        }
      });
    });
  }

  deleteProduct(): void {
    if (!this.selectedProduct) return;
    this.isLoading = true;
    this.productService.deleteProduct(this.selectedProduct.id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.selectedProduct = null;
        this.loadData();
        this.isLoading = false;
        Swal.fire({ icon: 'success', title: 'Supprimé', text: 'Produit supprimé avec succès', timer: 1800, timerProgressBar: true, confirmButtonColor: '#198754' });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
      }
    });
  }

  openAddFournisseurModal(): void {
    this.resetFournisseurForm();
    this.showAddFournisseurModal = true;
  }

  openEditFournisseurModal(fournisseur: Fournisseur): void {
    this.selectedFournisseur = fournisseur;
    this.fournisseurFormData = {
      nom: fournisseur.nom,
      code: fournisseur.code,
      adresse: fournisseur.adresse || '',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || '',
      siteWeb: fournisseur.siteWeb || '',
      contactNom: fournisseur.contactNom || '',
      contactTelephone: fournisseur.contactTelephone || '',
      contactEmail: fournisseur.contactEmail || '',
      description: fournisseur.description || '',
      typeProduits: fournisseur.typeProduits || '',
      conditionsPaiement: fournisseur.conditionsPaiement || '',
      delaiLivraison: fournisseur.delaiLivraison || null,
      note: fournisseur.note || null,
      actif: fournisseur.actif
    };
    this.showEditFournisseurModal = true;
  }

  openDeleteFournisseurModal(fournisseur: Fournisseur): void {
    this.selectedFournisseur = fournisseur;
    Swal.fire({
      title: '⚠️ Supprimer ce fournisseur ?',
      html: `<b>${fournisseur.nom}</b> (${fournisseur.code}) sera supprimé définitivement.<br><br>📊 Total achats: <strong>${this.formatPrice(fournisseur.totalAchats || 0)}</strong><br>💰 Solde actuel: <strong>${this.formatPrice(fournisseur.solde || 0)}</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (result.isConfirmed) this.deleteFournisseur();
      else this.selectedFournisseur = null;
    });
  }

  addFournisseur(): void {
    if (!this.fournisseurFormData.nom?.trim()) {
      Swal.fire('Erreur', 'Le nom du fournisseur est obligatoire', 'error');
      return;
    }
    if (!this.fournisseurFormData.code?.trim()) {
      Swal.fire('Erreur', 'Le code du fournisseur est obligatoire', 'error');
      return;
    }
    
    Swal.fire({
      title: '✅ Confirmer l\'ajout',
      html: `<div class="text-start">
               <p><strong>Détails du fournisseur :</strong></p>
               <ul>
                 <li>Nom: <strong>${this.fournisseurFormData.nom}</strong></li>
                 <li>Code: <strong>${this.fournisseurFormData.code}</strong></li>
                 <li>Téléphone: <strong>${this.fournisseurFormData.telephone || '-'}</strong></li>
               </ul>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, ajouter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.isLoading = true;
      this.productService.createFournisseur(this.fournisseurFormData).subscribe({
        next: (fournisseur) => {
          this.successMessage = `Fournisseur "${fournisseur.nom}" créé avec succès!`;
          this.showAddFournisseurModal = false;
          this.loadFournisseurs();
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Fournisseur créé', text: `"${fournisseur.nom}" ajouté`, timer: 2000, timerProgressBar: true });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire('Erreur', error.message, 'error');
        }
      });
    });
  }

  updateFournisseur(): void {
    if (!this.selectedFournisseur) return;
    
    Swal.fire({
      title: '✏️ Confirmer la modification',
      html: `Modifier le fournisseur <strong>${this.selectedFournisseur.nom}</strong> ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.isLoading = true;
      this.productService.updateFournisseur(this.selectedFournisseur.id, this.fournisseurFormData).subscribe({
        next: (fournisseur) => {
          this.successMessage = `Fournisseur "${fournisseur.nom}" modifié avec succès!`;
          this.showEditFournisseurModal = false;
          this.selectedFournisseur = null;
          this.loadFournisseurs();
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Fournisseur modifié', timer: 2000, timerProgressBar: true });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire('Erreur', error.message, 'error');
        }
      });
    });
  }

  deleteFournisseur(): void {
    if (!this.selectedFournisseur) return;
    this.isLoading = true;
    this.productService.deleteFournisseur(this.selectedFournisseur.id).subscribe({
      next: () => {
        this.successMessage = `Fournisseur supprimé avec succès!`;
        this.showDeleteFournisseurModal = false;
        this.selectedFournisseur = null;
        this.loadFournisseurs();
        this.isLoading = false;
        Swal.fire({ icon: 'success', title: 'Fournisseur supprimé', timer: 2000, timerProgressBar: true });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Erreur', error.message, 'error');
      }
    });
  }

  openAddCategoryModal(): void {
    this.categoryForm = { nom: '', description: '' };
    this.showAddCategoryModal = true;
  }

  startEditCategory(categorie: Categorie): void {
    this.selectedCategory = categorie;
    this.categoryForm = {
      nom: categorie.nom,
      description: categorie.description || ''
    };
    this.isEditingCategory = true;
  }

  cancelEditCategory(): void {
    this.isEditingCategory = false;
    this.selectedCategory = null;
    this.categoryForm = { nom: '', description: '' };
  }

  addCategory(): void {
    if (!this.categoryForm.nom?.trim()) {
      Swal.fire('Erreur', 'Le nom de la catégorie est obligatoire', 'error');
      return;
    }
    
    Swal.fire({
      title: '✅ Confirmer l\'ajout',
      html: `Ajouter la catégorie <strong>${this.categoryForm.nom}</strong> ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, ajouter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.isLoading = true;
      this.productService.createCategory(this.categoryForm).subscribe({
        next: (categorie) => {
          this.successMessage = `Catégorie "${categorie.nom}" créée avec succès!`;
          this.showAddCategoryModal = false;
          this.loadCategories();
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Catégorie créée', timer: 2000, timerProgressBar: true });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire('Erreur', error.message, 'error');
        }
      });
    });
  }

  updateCategory(): void {
    if (!this.selectedCategory) return;
    if (!this.categoryForm.nom?.trim()) {
      Swal.fire('Erreur', 'Le nom de la catégorie est obligatoire', 'error');
      return;
    }
    
    Swal.fire({
      title: '✏️ Confirmer la modification',
      html: `Modifier la catégorie <strong>${this.selectedCategory.nom}</strong> ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.isLoading = true;
      this.productService.updateCategory(this.selectedCategory.id, this.categoryForm).subscribe({
        next: (categorie) => {
          this.successMessage = `Catégorie "${categorie.nom}" modifiée avec succès!`;
          this.isEditingCategory = false;
          this.selectedCategory = null;
          this.loadCategories();
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Catégorie modifiée', timer: 2000, timerProgressBar: true });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire('Erreur', error.message, 'error');
        }
      });
    });
  }

  openDeleteCategoryModal(categorie: Categorie): void {
    const nbProduits = this.countProductsForCategory(categorie);
    if (nbProduits > 0) {
      Swal.fire('Impossible', `Cette catégorie contient ${nbProduits} produit(s). Supprimez-les d'abord.`, 'warning');
      return;
    }
    this.selectedCategory = categorie;
    Swal.fire({
      title: '⚠️ Supprimer cette catégorie ?',
      html: `<b>${categorie.nom}</b> sera supprimée définitivement.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (result.isConfirmed) this.deleteCategory();
      else this.selectedCategory = null;
    });
  }

  deleteCategory(): void {
    if (!this.selectedCategory) return;
    this.isLoading = true;
    this.productService.deleteCategory(this.selectedCategory.id).subscribe({
      next: () => {
        this.successMessage = `Catégorie supprimée avec succès!`;
        this.showDeleteCategoryModal = false;
        this.selectedCategory = null;
        this.loadCategories();
        this.isLoading = false;
        Swal.fire({ icon: 'success', title: 'Catégorie supprimée', timer: 2000, timerProgressBar: true });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Erreur', error.message, 'error');
      }
    });
  }

  countProductsForCategory(categorie: Categorie): number {
    return this.tousLesProduits.filter(p => p.categorie?.id === categorie.id).length;
  }

  openImportModal(): void {
    this.selectedFile = null;
    this.showImportModal = true;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire('Erreur', 'Fichier trop volumineux (max 10MB)', 'error');
        return;
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
        Swal.fire('Erreur', 'Format non supporté. Utilisez .xlsx, .xls ou .csv', 'error');
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  importProducts(): void {
    if (!this.selectedFile) return;
    
    Swal.fire({
      title: '📥 Confirmer l\'importation',
      html: `Importer le fichier <strong>${this.selectedFile.name}</strong> ?<br><br>⚠️ Les produits seront ajoutés ou mis à jour.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, importer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.isImporting = true;
      this.errorMessage = '';
      this.productService.importProducts(this.selectedFile!).subscribe({
        next: (result) => {
          this.importResult = result;
          this.showImportModal = false;
          this.showImportResultModal = true;
          this.isImporting = false;
          
          const successCount = result.success || 0;
          const errorCount = result.failed || 0;
          
          Swal.fire({
            icon: errorCount > 0 ? 'warning' : 'success',
            title: 'Import terminé',
            html: `✅ Succès: ${successCount}<br>⚠️ Erreurs: ${errorCount}`,
            timer: 3000,
            timerProgressBar: true
          });
          if (successCount > 0) {
            setTimeout(() => this.loadData(), 1000);
          }
        },
        error: (error) => {
          this.isImporting = false;
          Swal.fire('Erreur', error.message, 'error');
        }
      });
    });
  }

  downloadTemplate(): void {
    this.productService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-produits.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        Swal.fire({ icon: 'success', title: 'Téléchargement', text: 'Template téléchargé', timer: 1500 });
      },
      error: (error) => {
        Swal.fire('Erreur', error.message, 'error');
      }
    });
  }

  exportProducts(): void {
    Swal.fire({
      title: '📤 Exporter les produits',
      text: 'Voulez-vous exporter tous les produits ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, exporter',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.productService.exportProducts().subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `produits-${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          Swal.fire({ icon: 'success', title: 'Export réussi', timer: 1500 });
        },
        error: (error) => {
          Swal.fire('Erreur', error.message, 'error');
        }
      });
    });
  }

  exportFournisseurs(): void {
    Swal.fire({
      title: '📤 Exporter les fournisseurs',
      text: 'Voulez-vous exporter tous les fournisseurs ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, exporter',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      this.productService.exportFournisseurs().subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `fournisseurs-${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          Swal.fire({ icon: 'success', title: 'Export réussi', timer: 1500 });
        },
        error: (error) => {
          Swal.fire('Erreur', error.message, 'error');
        }
      });
    });
  }

  private resetProductForm(): void {
    this.productForm = {
      nom: '',
      description: '',
      categorieId: 0,
      fournisseurId: null,
      prixAchat: 0,
      prixVente: 0,
      quantite: 0,
      seuilAlerte: 10,
      codeBarre: '',
      dateCreation: new Date().toISOString().split('T')[0],
      datePeremption: null,
      lotNumber: '',
      conditionsStockage: '',
      poidsVolume: null,
      uniteMesure: '',
      bio: false,
      origine: ''
    };
  }

  private resetFournisseurForm(): void {
    this.fournisseurFormData = {
      nom: '',
      code: '',
      adresse: '',
      telephone: '',
      email: '',
      siteWeb: '',
      contactNom: '',
      contactTelephone: '',
      contactEmail: '',
      description: '',
      typeProduits: '',
      conditionsPaiement: '',
      delaiLivraison: null,
      note: null,
      actif: true
    };
  }

  private handleAuthError(error: any): void {
    if (error.message && (error.message.includes('Session expirée') || error.message.includes('Non authentifié'))) {
      this.authService.signout();
    }
  }

  closeAllModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDetailsModal = false;
    this.showDeleteModal = false;
    this.showAddFournisseurModal = false;
    this.showEditFournisseurModal = false;
    this.showDeleteFournisseurModal = false;
    this.showAddCategoryModal = false;
    this.isEditingCategory = false;
    this.showDeleteCategoryModal = false;
    this.showImportModal = false;
    this.showImportResultModal = false;
    this.selectedProduct = null;
    this.selectedFournisseur = null;
    this.selectedCategory = null;
    this.selectedFile = null;
    this.errorMessage = '';
  }

  closeImportResultModal(): void {
    this.showImportResultModal = false;
    this.importResult = null;
  }

  // ✅ CORRECTION: Utiliser produits (filtrés) au lieu de tousLesProduits
  get filteredProducts(): Produit[] {
    return this.produits;
  }

  get paginatedProducts(): Produit[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isVendeur(): boolean {
    return this.authService.isVendeur();
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  formatDate(date: string | undefined): string {
    return this.productService.formatDate(date);
  }

  getStockStatusClass(produit: Produit): string {
    if (produit.quantite === 0) return 'bg-danger';
    if (produit.stockFaible) return 'bg-warning text-dark';
    return 'bg-success';
  }

  getStockStatusText(produit: Produit): string {
    if (produit.quantite === 0) return 'Rupture';
    if (produit.stockFaible) return 'Faible';
    return 'Normal';
  }

  getPeremptionStatusClass(produit: Produit): string {
    if (produit.perime) return 'bg-danger';
    if (produit.prochePeremption) return 'bg-warning text-dark';
    return 'bg-success';
  }

  getAchatStatusText(achat: any): string {
    const montantTotal = achat.montantTotal || 0;
    const montantPaye = achat.montantPaye || 0;
    const montantRestant = montantTotal - montantPaye;
    
    if (montantRestant <= 0.01) return 'Payé';
    if (montantPaye > 0 && montantRestant > 0.01) return 'Partiel';
    return 'En cours';
  }

  getAchatStatusClass(achat: any): string {
    const montantTotal = achat.montantTotal || 0;
    const montantPaye = achat.montantPaye || 0;
    const montantRestant = montantTotal - montantPaye;
    
    if (montantRestant <= 0.01) return 'bg-success';
    if (montantPaye > 0 && montantRestant > 0.01) return 'bg-info';
    return 'bg-warning';
  }

  openAchatModal(fournisseur: Fournisseur): void {
    this.selectedFournisseurForAchat = fournisseur;
    this.achatForm = {
      fournisseurId: fournisseur.id,
      lignes: [],
      montantPaye: 0,
      modePaiementImmediat: 'ESPECES',
      compteIdPaiement: null,
      commentaire: ''
    };
    this.avanceFournisseurUtilisee = 0;
    this.avanceFournisseurDisponible = 0;
    this.tempLigneAchat = {
      quantite: 1,
      prixAchatUnitaire: 0
    };
    this.loadCategoriesForNewProduct();
    this.loadComptes();
    this.productService.getSoldeAvanceFournisseur(fournisseur.id).subscribe({
      next: (solde) => { this.avanceFournisseurDisponible = solde; },
      error: () => { this.avanceFournisseurDisponible = 0; }
    });
    this.showAchatModal = true;
  }

  loadCategoriesForNewProduct(): void {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categoriesPourNouveauProduit = categories;
      },
      error: (error) => console.error('Erreur chargement catégories pour nouveau produit', error)
    });
    this.productService.getAllProduitsForDropdown().subscribe({
      next: (produits) => {
        this.produitsDropdown = produits;
      },
      error: (error) => console.error('Erreur chargement produits pour dropdown', error)
    });
  }

  onProduitSelectionne(event: any): void {
    const produitId = event.target.value;
    if (produitId) {
      const produit = this.produitsDropdown.find(p => p.id === +produitId);
      if (produit) {
        this.tempLigneAchat.produitNom = produit.nom;
        this.tempLigneAchat.prixAchatUnitaire = produit.prixAchat;
      }
    }
  }

  ajouterLigneAchat(): void {
    if (!this.tempLigneAchat.quantite || this.tempLigneAchat.quantite <= 0) {
      Swal.fire('Erreur', 'Quantité invalide', 'error');
      return;
    }
    if (!this.tempLigneAchat.prixAchatUnitaire || this.tempLigneAchat.prixAchatUnitaire <= 0) {
      Swal.fire('Erreur', 'Prix d\'achat unitaire invalide', 'error');
      return;
    }
    const nouvelleLigne: LigneAchatRequest = {
      quantite: this.tempLigneAchat.quantite,
      prixAchatUnitaire: this.tempLigneAchat.prixAchatUnitaire
    };
    if (this.tempLigneAchat.produitId) {
      nouvelleLigne.produitId = this.tempLigneAchat.produitId;
    }
    if (this.tempLigneAchat.nouveauProduitNom && this.tempLigneAchat.nouveauProduitNom.trim()) {
      nouvelleLigne.nouveauProduitNom = this.tempLigneAchat.nouveauProduitNom.trim();
      nouvelleLigne.nouvelleCategorieId = this.tempLigneAchat.nouvelleCategorieId;
      nouvelleLigne.prixVente = this.tempLigneAchat.prixVente;
      nouvelleLigne.description = this.tempLigneAchat.description;
      nouvelleLigne.codeBarre = this.tempLigneAchat.codeBarre;
      nouvelleLigne.seuilAlerte = this.tempLigneAchat.seuilAlerte;
      nouvelleLigne.uniteMesure = this.tempLigneAchat.uniteMesure;
      nouvelleLigne.bio = this.tempLigneAchat.bio || false;
      nouvelleLigne.origine = this.tempLigneAchat.origine;
      nouvelleLigne.typeVente = this.tempLigneAchat.typeVente;
    }
    this.achatForm.lignes.push(nouvelleLigne);
    this.tempLigneAchat = {
      quantite: 1,
      prixAchatUnitaire: 0,
      produitId: undefined,
      produitNom: undefined,
      nouveauProduitNom: undefined,
      nouvelleCategorieId: undefined,
      prixVente: undefined,
      description: undefined,
      codeBarre: undefined,
      seuilAlerte: undefined,
      uniteMesure: undefined,
      bio: false,
      origine: undefined,
      typeVente: undefined
    };
    Swal.fire({ icon: 'success', title: 'Ligne ajoutée', text: 'Produit ajouté à l\'achat', timer: 1000 });
  }

  supprimerLigneAchat(index: number): void {
    Swal.fire({
      title: 'Supprimer cette ligne ?',
      text: 'Cette action est irréversible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then(result => {
      if (result.isConfirmed) {
        this.achatForm.lignes.splice(index, 1);
        Swal.fire({ icon: 'success', title: 'Ligne supprimée', timer: 1000 });
      }
    });
  }

  creerAchat(): void {
    if (!this.achatForm.lignes.length) {
      Swal.fire('Erreur', 'Ajoutez au moins un produit à l\'achat', 'error');
      return;
    }
    
    const totalAchat = this.calculerTotalAchat();
    const avanceUtilisee = this.avanceFournisseurUtilisee || 0;
    const paiementImmediat = this.achatForm.montantPaye || 0;
    const resteAPayer = totalAchat - avanceUtilisee - paiementImmediat;
    const modePaiement = this.achatForm.modePaiementImmediat || 'ESPECES';
    
    let modeTexte = modePaiement === 'BANQUE' ? 'virement bancaire' : 'espèces';
    
    Swal.fire({
      title: '💰 Confirmer l\'achat',
      html: `
        <div class="text-start">
          <p><strong>Récapitulatif de l'achat :</strong></p>
          <ul>
            <li>Total: <strong>${this.formatPrice(totalAchat)}</strong></li>
            ${avanceUtilisee > 0 ? `<li>Avance utilisée: <strong class="text-success">${this.formatPrice(avanceUtilisee)}</strong> (déjà payé)</li>` : ''}
            ${paiementImmediat > 0 ? `<li>Paiement immédiat: <strong>${this.formatPrice(paiementImmediat)}</strong> (${modeTexte})</li>` : ''}
            <li>Reste à payer: <strong class="${resteAPayer > 0 ? 'text-danger' : 'text-success'}">${this.formatPrice(resteAPayer)}</strong></li>
          </ul>
          <hr>
          <p class="mb-0"><strong>Fournisseur:</strong> ${this.selectedFournisseurForAchat?.nom}</p>
          ${this.achatForm.commentaire ? `<p class="mb-0"><strong>Commentaire:</strong> ${this.achatForm.commentaire}</p>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✅ Oui, confirmer l\'achat',
      cancelButtonText: '❌ Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      let userId: number | undefined;
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id;
        } catch(e) {}
      }
      if (!userId) userId = 1;
      
      const request: AchatFournisseurRequest = {
        fournisseurId: this.selectedFournisseurForAchat?.id,
        lignes: this.achatForm.lignes,
        montantPaye: paiementImmediat,
        montantAvanceUtilise: avanceUtilisee,
        modePaiementImmediat: modePaiement,
        compteIdPaiement: modePaiement === 'BANQUE' ? this.achatForm.compteIdPaiement : undefined,
        commentaire: this.achatForm.commentaire,
        utilisateurId: userId
      };
      
      this.isLoading = true;
      this.productService.creerAchat(request).subscribe({
        next: (achat) => {
          this.successMessage = `Achat enregistré avec succès. Total: ${this.formatPrice(achat.montantTotal)}`;
          this.showAchatModal = false;
          this.isLoading = false;
          this.loadFournisseurs();
          this.loadData();
          Swal.fire({ icon: 'success', title: 'Achat enregistré', text: `Total: ${this.formatPrice(achat.montantTotal)}`, timer: 2500 });
        },
        error: (error) => {
          this.isLoading = false;
          let errorMsg = error.message;
          if (errorMsg.toLowerCase().includes('solde') || errorMsg.toLowerCase().includes('insuffisant')) {
            Swal.fire({
              icon: 'error',
              title: '❌ Solde insuffisant !',
              html: `<strong>Vérifiez ${modePaiement === 'BANQUE' ? 'le compte bancaire' : 'la caisse'}</strong><br><br>${errorMsg}`,
              confirmButtonColor: '#d33'
            });
          } else {
            Swal.fire('Erreur', errorMsg, 'error');
          }
        }
      });
    });
  }

  loadAchatsNonPayes(fournisseurId: number): void {
    console.log('🔍 Chargement des achats non payés pour fournisseur:', fournisseurId);
    
    this.productService.getHistoriqueAchats(fournisseurId).subscribe({
      next: (achats) => {
        console.log('📦 Tous les achats reçus:', achats);
        
        if (!achats || achats.length === 0) {
          console.log('⚠️ Aucun achat trouvé pour ce fournisseur');
          this.achatsNonPayes = [];
          return;
        }
        
        this.achatsNonPayes = achats.filter(achat => {
          const total = achat.montantTotal || 0;
          const paye = achat.montantPaye || 0;
          const restant = total - paye;
          const estNonPaye = restant > 0.01 && achat.statut !== 'ANNULE';
          
          console.log(`📋 Achat #${achat.id}: total=${total}, paye=${paye}, restant=${restant}, nonPaye=${estNonPaye}`);
          
          return estNonPaye;
        });
        
        console.log('✅ Achats non payés filtrés:', this.achatsNonPayes);
        console.log('📊 Nombre d\'achats non payés:', this.achatsNonPayes.length);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des achats:', err);
        this.achatsNonPayes = [];
      }
    });
  }

  openPaiementModal(fournisseur: Fournisseur): void {
    console.log('💰 Ouverture modal paiement pour:', fournisseur.nom);
    
    this.selectedFournisseurForPaiement = fournisseur;
    this.paiementForm = {
      fournisseurId: fournisseur.id,
      montant: 0,
      modePaiement: 'ESPECES',
      reference: '',
      observation: '',
      compteId: undefined,
      achatCibleId: null
    };
    this.soldeRestant = 0;
    this.nouveauSolde = 0;
    this.montantMaxPaiement = 0;
    this.showPaiementModal = true;
    
    this.chargerSoldeRestant(fournisseur.id);
    this.loadComptes();
    this.loadAchatsNonPayes(fournisseur.id);
  }

  loadComptes(): void {
    this.isLoadingComptes = true;
    this.compteService.getTousLesComptes().subscribe({
      next: (comptes) => { this.comptes = comptes; this.isLoadingComptes = false; },
      error: () => { this.comptes = []; this.isLoadingComptes = false; }
    });
  }

  onAchatSelectionnePourPaiement(): void {
    console.log('🔄 Sélection achat:', this.paiementForm.achatCibleId);
    
    if (this.paiementForm.achatCibleId) {
      const achat = this.achatsNonPayes.find(a => a.id === this.paiementForm.achatCibleId);
      if (achat) {
        const restant = (achat.montantTotal || 0) - (achat.montantPaye || 0);
        this.montantMaxPaiement = restant;
        this.soldeRestant = restant;
        this.nouveauSolde = restant;
        this.paiementForm.montant = 0;
        console.log('💰 Montant max pour cet achat:', restant);
      }
    } else {
      this.chargerSoldeRestant(this.selectedFournisseurForPaiement!.id);
    }
  }

  chargerSoldeRestant(fournisseurId: number): void {
    this.isLoadingSolde = true;
    this.productService.getSituationFournisseur(fournisseurId).subscribe({
      next: (situation) => {
        this.soldeRestant = situation.solde;
        this.montantMaxPaiement = situation.solde;
        this.nouveauSolde = situation.solde;
        this.isLoadingSolde = false;
      },
      error: (error) => {
        console.error('Erreur chargement solde:', error);
        this.isLoadingSolde = false;
        Swal.fire('Erreur', 'Impossible de charger le solde du fournisseur', 'error');
      }
    });
  }

  setMontant(montant: number): void {
    if (montant && montant > 0 && montant <= this.montantMaxPaiement) {
      this.paiementForm.montant = montant;
      this.nouveauSolde = this.montantMaxPaiement - montant;
    }
  }

  onMontantChange(): void {
    const montant = this.paiementForm.montant || 0;
    if (montant > this.montantMaxPaiement) {
      this.paiementForm.montant = this.montantMaxPaiement;
      this.nouveauSolde = 0;
    } else {
      this.nouveauSolde = this.montantMaxPaiement - montant;
    }
  }

  closePaiementModal(): void {
    this.showPaiementModal = false;
    this.paiementForm = {
      fournisseurId: 0,
      montant: 0,
      modePaiement: 'ESPECES',
      reference: '',
      observation: '',
      compteId: undefined,
      achatCibleId: null
    };
    this.soldeRestant = 0;
    this.nouveauSolde = 0;
    this.montantMaxPaiement = 0;
    this.achatsNonPayes = [];
    this.errorMessage = '';
  }

  effectuerPaiement(): void {
    if (!this.paiementForm.montant || this.paiementForm.montant <= 0) {
      Swal.fire('Erreur', 'Montant invalide', 'error');
      return;
    }
    if (this.paiementForm.montant > this.montantMaxPaiement) {
      Swal.fire('Erreur', 'Le montant ne peut pas dépasser le solde restant', 'error');
      return;
    }
    
    const nouveauSoldeCalcule = this.montantMaxPaiement - this.paiementForm.montant;
    const modeTexte = this.paiementForm.modePaiement === 'ESPECES' ? 'espèces (caisse)' : 'banque';
    const achatTexte = this.paiementForm.achatCibleId ? `pour l'achat #${this.paiementForm.achatCibleId}` : 'pour les achats (FIFO)';
    
    Swal.fire({
      title: '💰 Confirmer le paiement',
      html: `
        <div class="text-start">
          <p><strong>Paiement de ${this.formatPrice(this.paiementForm.montant)}</strong> ${achatTexte}</p>
          <ul>
            <li>Mode: <strong>${modeTexte}</strong></li>
            <li>Montant à payer: <strong>${this.formatPrice(this.montantMaxPaiement)}</strong></li>
            <li>Nouveau solde: <strong class="${nouveauSoldeCalcule <= 0 ? 'text-success' : 'text-warning'}">${this.formatPrice(nouveauSoldeCalcule)}</strong></li>
          </ul>
          <p class="mb-0"><strong>Fournisseur:</strong> ${this.selectedFournisseurForPaiement?.nom}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✅ Oui, confirmer le paiement',
      cancelButtonText: '❌ Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      let userId: number | undefined;
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id;
        } catch(e) {}
      }
      if (!userId) userId = 1;
      
      const request: any = {
        fournisseurId: this.selectedFournisseurForPaiement!.id,
        montant: this.paiementForm.montant,
        modePaiement: this.paiementForm.modePaiement,
        reference: this.paiementForm.reference,
        observation: this.paiementForm.observation,
        utilisateurId: userId,
        compteId: this.paiementForm.modePaiement === 'BANQUE' ? this.paiementForm.compteId : undefined,
        achatCibleId: this.paiementForm.achatCibleId || undefined
      };
      
      this.isLoading = true;
      this.productService.payerFournisseur(request).subscribe({
        next: (paiement) => {
          let statusMessage = `Paiement de ${this.formatPrice(paiement.montant)} enregistré.`;
          let icon = 'success';
          
          if (nouveauSoldeCalcule <= 0) {
            statusMessage = `✅ Paiement complété ! Toutes les dettes sont soldées. Nouveau solde: 0 F`;
          } else {
            statusMessage = `⚠️ Paiement partiel effectué. Reste à payer: ${this.formatPrice(nouveauSoldeCalcule)}`;
          }
          
          this.closePaiementModal();
          this.isLoading = false;
          this.loadFournisseurs();
          this.loadData();
          
          Swal.fire({ icon: 'success', title: 'Paiement effectué', text: statusMessage, timer: 3000 });
          
          if (this.showSituationModal && this.selectedFournisseurForSituation) {
            setTimeout(() => {
              this.productService.getSituationFournisseur(this.selectedFournisseurForSituation!.id).subscribe({
                next: (data) => {
                  if (data && data.achatsRecents) {
                    data.achatsRecents = data.achatsRecents.map(achat => {
                      const restant = (achat.montantTotal || 0) - (achat.montantPaye || 0);
                      return {
                        ...achat,
                        montantRestant: restant,
                        statut: restant <= 0.01 ? 'PAYE' : achat.statut
                      };
                    });
                  }
                  this.fournisseurSituation = data;
                },
                error: (err) => console.error('Erreur rafraîchissement situation:', err)
              });
            }, 500);
          }
        },
        error: (error) => {
          this.isLoading = false;
          let errorMsg = error.message;
          if (errorMsg.toLowerCase().includes('solde') || errorMsg.toLowerCase().includes('insuffisant')) {
            Swal.fire({
              icon: 'error',
              title: '❌ Solde insuffisant !',
              html: `<strong>Vérifiez ${this.paiementForm.modePaiement === 'BANQUE' ? 'le compte bancaire' : 'la caisse'}</strong><br><br>${errorMsg}`,
              confirmButtonColor: '#d33'
            });
          } else {
            Swal.fire('Erreur', errorMsg, 'error');
          }
        }
      });
    });
  }

  openSituationModal(fournisseur: Fournisseur): void {
    this.selectedFournisseurForSituation = fournisseur;
    this.isLoadingSituation = true;
    this.fournisseurSituation = null;
    this.productService.getSituationFournisseur(fournisseur.id).subscribe({
      next: (data) => {
        console.log('Situation reçue:', data);
        if (data && data.achatsRecents) {
          data.achatsRecents = data.achatsRecents.map(achat => {
            const restant = (achat.montantTotal || 0) - (achat.montantPaye || 0);
            return {
              ...achat,
              montantRestant: restant,
              statut: restant <= 0.01 ? 'PAYE' : achat.statut
            };
          });
        }
        this.fournisseurSituation = data;
        this.isLoadingSituation = false;
        this.showSituationModal = true;
      },
      error: (error) => {
        this.isLoadingSituation = false;
        Swal.fire('Erreur', error.message, 'error');
      }
    });
  }

  openAvanceFournisseurModal(fournisseur: Fournisseur): void {
    this.selectedFournisseurForAvance = fournisseur;
    this.avanceFournisseurForm = {
      fournisseurId: fournisseur.id,
      montant: 0,
      motif: '',
      sourceFinancement: 'CAISSE',
      compteId: undefined
    };
    this.loadComptes();
    this.showAvanceFournisseurModal = true;
  }

  openHistoriqueAvancesModal(fournisseur: Fournisseur): void {
    this.selectedFournisseurForHistorique = fournisseur;
    this.historiqueAvancesFournisseur = [];
    this.isLoadingAvance = true;
    this.showHistoriqueAvancesModal = true;
    this.productService.getHistoriqueAvancesFournisseur(fournisseur.id).subscribe({
      next: (avances) => { this.historiqueAvancesFournisseur = avances; this.isLoadingAvance = false; },
      error: () => { this.isLoadingAvance = false; }
    });
  }

  getSoldeAvanceForFournisseur(fournisseur: Fournisseur): void {
    this.productService.getSoldeAvanceFournisseur(fournisseur.id).subscribe({
      next: (solde) => { this.avanceFournisseurDisponible = solde; },
      error: () => { this.avanceFournisseurDisponible = 0; }
    });
  }

  getTotalAvancesDisponibles(): number {
    return this.historiqueAvancesFournisseur.reduce((sum, a) => sum + (a.montantDisponible || 0), 0);
  }

  getSumAvances(field: 'montant' | 'montantUtilise' | 'montantDisponible'): number {
    return this.historiqueAvancesFournisseur.reduce((sum, a) => sum + ((a as any)[field] || 0), 0);
  }

  submitAvanceFournisseur(): void {
    if (!this.avanceFournisseurForm.montant || this.avanceFournisseurForm.montant <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Montant invalide',
        text: 'Le montant de l\'avance doit être supérieur à 0',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (this.avanceFournisseurForm.sourceFinancement === 'BANQUE' && !this.avanceFournisseurForm.compteId) {
      Swal.fire({
        icon: 'error',
        title: 'Compte bancaire requis',
        text: 'Veuillez sélectionner un compte bancaire pour cette avance',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const montantAvance = this.avanceFournisseurForm.montant;
    const source = this.avanceFournisseurForm.sourceFinancement === 'CAISSE' ? 'Caisse' : 'Banque';
    const fournisseurNom = this.selectedFournisseurForAvance?.nom || 'Fournisseur';

    if (this.avanceFournisseurForm.sourceFinancement === 'CAISSE') {
      this.isLoading = true;
      this.http.get<any>(`${environment.apiUrl}/caisse/etat`).subscribe({
        next: (caisseData) => {
          const soldeCaisse = caisseData.caisse?.soldeActuel || 0;
          
          if (soldeCaisse < montantAvance) {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: '❌ Solde caisse insuffisant !',
              html: `<strong>Vérifiez bien la caisse</strong><br><br>
                     📊 Solde actuel de la caisse : <strong>${soldeCaisse.toLocaleString('fr-FR')} F</strong><br>
                     💸 Montant demandé : <strong>${montantAvance.toLocaleString('fr-FR')} F</strong><br><br>
                     <span class="text-danger">Le solde de la caisse est insuffisant pour effectuer cette avance.</span><br>
                     Veuillez vérifier les entrées/sorties de caisse avant de réessayer.`,
              confirmButtonText: 'OK',
              confirmButtonColor: '#d33'
            });
            return;
          }
          
          this.afficherConfirmationAvance(montantAvance, source, fournisseurNom, soldeCaisse);
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de vérifier l\'état de la caisse. Veuillez réessayer.',
            confirmButtonColor: '#d33'
          });
        }
      });
      return;
    }

    if (this.avanceFournisseurForm.sourceFinancement === 'BANQUE') {
      const compteId = this.avanceFournisseurForm.compteId;
      const compte = this.comptes.find(c => c.id === compteId);
      
      if (!compte) {
        Swal.fire({
          icon: 'error',
          title: 'Compte introuvable',
          text: 'Le compte bancaire sélectionné est introuvable',
          confirmButtonColor: '#d33'
        });
        return;
      }
      
      this.isLoading = true;
      this.http.get<any>(`${environment.apiUrl}/comptes/${compteId}`).subscribe({
        next: (compteData) => {
          const soldeCompte = compteData.soldeActuel || 0;
          
          if (soldeCompte < montantAvance) {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: '❌ Solde bancaire insuffisant !',
              html: `<strong>Vérifiez le compte bancaire</strong><br><br>
                     🏦 Compte : <strong>${compte.nomBanque}</strong><br>
                     📊 Solde actuel : <strong>${soldeCompte.toLocaleString('fr-FR')} F</strong><br>
                     💸 Montant demandé : <strong>${montantAvance.toLocaleString('fr-FR')} F</strong><br><br>
                     <span class="text-danger">Le solde du compte bancaire est insuffisant pour effectuer cette avance.</span><br>
                     Veuillez vérifier le compte avant de réessayer.`,
              confirmButtonText: 'OK',
              confirmButtonColor: '#d33'
            });
            return;
          }
          
          this.afficherConfirmationAvanceBancaire(montantAvance, source, fournisseurNom, compte, soldeCompte);
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de vérifier le solde du compte bancaire',
            confirmButtonColor: '#d33'
          });
        }
      });
      return;
    }
  }

  afficherConfirmationAvance(montantAvance: number, source: string, fournisseurNom: string, soldeCaisse: number): void {
    const nouveauSoldeCaisse = soldeCaisse - montantAvance;
    
    Swal.fire({
      title: '⚠️ Confirmation d\'avance fournisseur',
      html: `
        <div class="text-start">
          <p class="fw-bold mb-2">📝 Détails de l'opération :</p>
          <table style="width:100%; margin:10px 0">
            <tr><td style="width:50%"><strong>Fournisseur :</strong></td><td>${fournisseurNom}</td></tr>
            <tr><td><strong>Montant :</strong></td><td class="text-primary fw-bold">${montantAvance.toLocaleString('fr-FR')} F</td></tr>
            <tr><td><strong>Source :</strong></td><td>🏦 ${source}</td></tr>
            <tr><td><strong>Motif :</strong></td><td>${this.avanceFournisseurForm.motif || 'Avance fournisseur'}</td></tr>
          </table>
          <hr class="my-2">
          <p class="text-muted small mb-2">💰 Après cette opération :</p>
          <ul class="small">
            <li>Caisse : <strong class="${nouveauSoldeCaisse >= 0 ? 'text-success' : 'text-danger'}">${nouveauSoldeCaisse.toLocaleString('fr-FR')} F</strong></li>
            <li>Avance disponible pour ce fournisseur : <strong class="text-info">${montantAvance.toLocaleString('fr-FR')} F</strong></li>
          </ul>
          <div class="alert alert-warning py-2 mb-0 mt-2">
            <i class="fa fa-exclamation-triangle me-1"></i>
            Cette opération est <strong>irréversible</strong> ! L'avance sera déduite de la caisse.
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✅ Oui, confirmer l\'avance',
      cancelButtonText: '❌ Annuler',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.executerAvanceFournisseur();
    });
  }

  afficherConfirmationAvanceBancaire(montantAvance: number, source: string, fournisseurNom: string, compte: Compte, soldeCompte: number): void {
    const nouveauSoldeCompte = soldeCompte - montantAvance;
    
    Swal.fire({
      title: '⚠️ Confirmation d\'avance fournisseur',
      html: `
        <div class="text-start">
          <p class="fw-bold mb-2">📝 Détails de l'opération :</p>
          <table style="width:100%; margin:10px 0">
            <tr><td style="width:50%"><strong>Fournisseur :</strong></td><td>${fournisseurNom}</td></tr>
            <tr><td><strong>Montant :</strong></td><td class="text-primary fw-bold">${montantAvance.toLocaleString('fr-FR')} F</td></tr>
            <tr><td><strong>Source :</strong></td><td>🏦 ${source}</td></tr>
            <tr><td><strong>Compte bancaire :</strong></td><td>${compte.nomBanque} (${compte.numeroCompte || 'N°' + compte.id})</td></tr>
            <tr><td><strong>Motif :</strong></td><td>${this.avanceFournisseurForm.motif || 'Avance fournisseur'}</td></tr>
          </table>
          <hr class="my-2">
          <p class="text-muted small mb-2">💰 Après cette opération :</p>
          <ul class="small">
            <li>Compte ${compte.nomBanque} : <strong class="${nouveauSoldeCompte >= 0 ? 'text-success' : 'text-danger'}">${nouveauSoldeCompte.toLocaleString('fr-FR')} F</strong></li>
            <li>Avance disponible pour ce fournisseur : <strong class="text-info">${montantAvance.toLocaleString('fr-FR')} F</strong></li>
          </ul>
          <div class="alert alert-warning py-2 mb-0 mt-2">
            <i class="fa fa-exclamation-triangle me-1"></i>
            Cette opération est <strong>irréversible</strong> ! L'avance sera déduite du compte bancaire.
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✅ Oui, confirmer l\'avance',
      cancelButtonText: '❌ Annuler',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.executerAvanceFournisseur();
    });
  }

  executerAvanceFournisseur(): void {
    let userId: number | undefined;
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) userId = JSON.parse(stored).id;
    } catch(e) {}
    
    this.isLoading = true;
    this.productService.enregistrerAvanceFournisseur({
      ...this.avanceFournisseurForm,
      utilisateurId: userId
    }).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.showAvanceFournisseurModal = false;
        
        Swal.fire({
          icon: 'success',
          title: '✅ Avance enregistrée !',
          html: `
            <strong>${this.formatPrice(this.avanceFournisseurForm.montant)} F</strong> 
            d'avance pour <strong>${this.selectedFournisseurForAvance?.nom}</strong><br><br>
            💰 Source : ${this.avanceFournisseurForm.sourceFinancement === 'CAISSE' ? 'Caisse' : 'Banque'}<br>
            📝 Motif : ${this.avanceFournisseurForm.motif || 'Avance fournisseur'}
          `,
          timer: 3000,
          timerProgressBar: true,
          confirmButtonColor: '#198754'
        });
        
        setTimeout(() => {
          this.loadFournisseurs();
          if (this.selectedFournisseurForAvance) {
            this.getSoldeAvanceForFournisseur(this.selectedFournisseurForAvance);
          }
        }, 1000);
      },
      error: (err) => {
        this.isLoading = false;
        
        let errorMessage = err.message || 'Erreur lors de l\'enregistrement de l\'avance';
        
        if (errorMessage.toLowerCase().includes('insuffisant')) {
          Swal.fire({
            icon: 'error',
            title: '❌ Solde insuffisant !',
            html: `<strong>Vérifiez bien ${this.avanceFournisseurForm.sourceFinancement === 'CAISSE' ? 'la caisse' : 'le compte bancaire'}</strong><br><br>
                   ${errorMessage}<br><br>
                   Veuillez vérifier le solde avant de réessayer.`,
            confirmButtonColor: '#d33'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
            confirmButtonColor: '#d33'
          });
        }
      }
    });
  }

  openRetourAchatModal(achat: any): void {
    this.selectedAchatPourRetour = achat;
    this.retourAchatModeRemboursement = 'CAISSE';
    this.retourAchatCompteId = undefined;
    this.retourAchatMotif = '';
    this.retourAchatLignes = [];
    this.isLoading = true;
    this.loadComptes();
    this.showRetourAchatModal = true;

    this.productService.getAchatById(achat.id).subscribe({
      next: (achatDetail: any) => {
        this.retourAchatLignes = (achatDetail.lignes || []).map((l: any) => ({
          ligneAchatId: l.id,
          produitId: l.produit?.id || l.produitId,
          produitNom: l.produit?.nom || l.produitNom || 'Produit',
          prixUnitaire: l.prixAchatUnitaire || 0,
          quantiteMax: l.quantite || 0,
          quantiteRetournee: l.quantite || 0,
          selected: true
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger les produits de cet achat', 'error');
      }
    });
  }

  get totalRetourAchat(): number {
    return this.retourAchatLignes
      .filter(l => l.selected && l.quantiteRetournee > 0)
      .reduce((sum, l) => sum + l.quantiteRetournee * l.prixUnitaire, 0);
  }

  submitRetourAchat(): void {
    const lignesSel = this.retourAchatLignes.filter(l => l.selected && l.quantiteRetournee > 0);
    if (!lignesSel.length) {
      Swal.fire('Erreur', 'Sélectionnez au moins un produit à retourner', 'error');
      return;
    }
    if (this.retourAchatModeRemboursement === 'BANQUE' && !this.retourAchatCompteId) {
      Swal.fire('Erreur', 'Veuillez sélectionner un compte bancaire', 'error');
      return;
    }
    
    const totalRetour = this.totalRetourAchat;
    Swal.fire({
      title: '⚠️ Confirmer le retour achat',
      html: `<div class="text-start">
               <p><strong>Retour de ${this.formatPrice(totalRetour)}</strong> au fournisseur</p>
               <ul>
                 <li>📦 ${lignesSel.length} produit(s) retourné(s)</li>
                 <li>💰 Mode remboursement: <strong>${this.retourAchatModeRemboursement === 'CAISSE' ? 'Caisse' : 'Banque'}</strong></li>
               </ul>
               <div class="alert alert-danger mt-2">⚠️ Cette action est <strong>irréversible</strong> !</div>
             </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✅ Oui, confirmer le retour',
      cancelButtonText: '❌ Annuler',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      let userId: number | undefined;
      try { const s = localStorage.getItem('currentUser'); if (s) userId = JSON.parse(s).id; } catch(e) {}

      const request: RetourAchatRequest = {
        achatId: this.selectedAchatPourRetour.id,
        motif: this.retourAchatMotif,
        modeRemboursement: this.retourAchatModeRemboursement,
        compteId: this.retourAchatModeRemboursement === 'BANQUE' ? this.retourAchatCompteId : undefined,
        utilisateurId: userId,
        lignes: lignesSel.map(l => ({
          ligneAchatId: l.ligneAchatId,
          produitId: l.produitId,
          quantiteRetournee: l.quantiteRetournee,
          prixUnitaire: l.prixUnitaire
        }))
      };
      
      this.isLoading = true;
      this.productService.effectuerRetourAchat(request).subscribe({
        next: (retour) => {
          this.showRetourAchatModal = false;
          this.isLoading = false;
          this.loadFournisseurs();
          this.loadData();
          const msg = retour.montantRembourse > 0
            ? `Remboursement de ${this.formatPrice(retour.montantRembourse)} effectué`
            : `Dette réduite de ${this.formatPrice(retour.montantDetteReduit)}`;
          Swal.fire({ icon: 'success', title: 'Retour enregistré', text: msg, timer: 3000 });
        },
        error: (err) => {
          this.isLoading = false;
          let errorMsg = err.message;
          if (errorMsg.toLowerCase().includes('solde') || errorMsg.toLowerCase().includes('insuffisant')) {
            Swal.fire({
              icon: 'error',
              title: '❌ Solde insuffisant !',
              html: `<strong>Vérifiez ${this.retourAchatModeRemboursement === 'BANQUE' ? 'le compte bancaire' : 'la caisse'}</strong><br><br>${errorMsg}`,
              confirmButtonColor: '#d33'
            });
          } else {
            Swal.fire('Erreur', errorMsg, 'error');
          }
        }
      });
    });
  }

  annulerAchat(achat: any): void {
    const montantTotal = achat.montantTotal || 0;
    const montantPaye = achat.montantPaye || 0;
    const montantAvance = achat.montantAvanceUtilise || 0;
    const montantImmediat = montantPaye - montantAvance;
    const modePaiementImmediat = achat.modePaiementImmediat || 'ESPECES';
    
    let messageHtml = `
      <div class="text-start">
        <p class="fw-bold mb-2">⚠️ Annulation de l'achat #${achat.id}</p>
        <p>Montant total: <strong>${this.formatPrice(montantTotal)}</strong></p>
        <hr class="my-2">
        <p class="mb-1">Conséquences de l'annulation :</p>
        <ul class="mb-2">
          <li>📦 <strong>Retrait du stock</strong> (${achat.lignes?.length || 0} produit(s))</li>
    `;
    
    if (montantAvance > 0) {
      messageHtml += `<li>💰 <strong>Remboursement avance: ${this.formatPrice(montantAvance)}</strong> (retourne dans l'avance fournisseur)</li>`;
    }
    
    if (montantImmediat > 0) {
      messageHtml += `<li>💳 <strong>Remboursement paiement: ${this.formatPrice(montantImmediat)}</strong> (${modePaiementImmediat === 'BANQUE' ? 'virement bancaire' : 'espèces'})</li>`;
    }
    
    if (montantAvance === 0 && montantImmediat === 0) {
      messageHtml += `<li>💰 <strong>Aucun remboursement</strong> (achat non payé)</li>`;
    }
    
    messageHtml += `
        </ul>
        <div class="alert alert-danger py-2 mb-0 mt-2">
          <i class="fa fa-exclamation-triangle me-1"></i>
          Cette action est <strong>irréversible</strong> !
        </div>
      </div>
    `;
    
    Swal.fire({
      title: '⚠️ Annuler cet achat ?',
      html: messageHtml,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✅ Oui, annuler',
      cancelButtonText: '❌ Non',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      
      let userId: number | undefined;
      try {
        const stored = localStorage.getItem('currentUser');
        if (stored) userId = JSON.parse(stored).id;
      } catch(e) {}
      
      this.isLoading = true;
      this.productService.annulerAchatFournisseur(achat.id, userId).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadFournisseurs();
          this.loadData();
          
          if (this.showSituationModal && this.selectedFournisseurForSituation) {
            setTimeout(() => {
              this.productService.getSituationFournisseur(this.selectedFournisseurForSituation!.id).subscribe({
                next: (data) => {
                  if (data && data.achatsRecents) {
                    data.achatsRecents = data.achatsRecents.map(a => {
                      const restant = (a.montantTotal || 0) - (a.montantPaye || 0);
                      return {
                        ...a,
                        montantRestant: restant,
                        statut: restant <= 0.01 ? 'PAYE' : a.statut
                      };
                    });
                  }
                  this.fournisseurSituation = data;
                },
                error: (err) => console.error('Erreur rafraîchissement situation:', err)
              });
            }, 500);
          }
          
          let remboursementMsg = '';
          if (montantAvance > 0 && montantImmediat > 0) {
            remboursementMsg = `Avance restituée: ${this.formatPrice(montantAvance)} - Paiement remboursé: ${this.formatPrice(montantImmediat)}`;
          } else if (montantAvance > 0) {
            remboursementMsg = `Avance restituée: ${this.formatPrice(montantAvance)}`;
          } else if (montantImmediat > 0) {
            remboursementMsg = `Paiement remboursé: ${this.formatPrice(montantImmediat)} (${modePaiementImmediat === 'BANQUE' ? 'banque' : 'caisse'})`;
          } else {
            remboursementMsg = `Aucun remboursement (achat non payé)`;
          }
          
          Swal.fire({
            icon: 'success',
            title: 'Achat annulé',
            html: `✅ L'achat a été annulé.<br>📦 Stock corrigé.<br>💰 ${remboursementMsg}`,
            timer: 4000,
            timerProgressBar: true,
            confirmButtonColor: '#198754'
          });
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.message || 'Erreur lors de l\'annulation de l\'achat',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    });
  }

  calculerTotalAchat(): number {
    return this.achatForm.lignes.reduce((total, ligne) => total + (ligne.quantite * ligne.prixAchatUnitaire), 0);
  }
}