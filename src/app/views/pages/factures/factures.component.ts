import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { AuthService, User } from '../../../shared/services/auth.service';
import { FactureService, Facture, FactureRequest, LigneFactureRequest, StatistiquesFactures, FactureStatut, FactureRemiseType } from '../../../shared/services/facture.service';
import { ClientService, Client } from '../../../shared/services/client.service';
import { ProductService, Produit } from '../../../shared/services/product.service';

@Component({
  selector: 'app-factures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './factures.component.html',
  styleUrls: ['./factures.component.scss']
})
export class FacturesComponent implements OnInit, OnDestroy {

  factures: Facture[] = [];
  selectedFacture: Facture | null = null;
  statistiques: StatistiquesFactures | null = null;
  clients: Client[] = [];
  filteredClients: Client[] = [];
  
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  currentUser: User | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 10;

  searchTerm: string = '';
  statutFilter: string = '';
  dateDebut: string = '';
  dateFin: string = '';

  factureForm: FactureRequest = {
    clientNom: '',
    clientPrenom: '',
    clientTelephone: '',
    clientAdresse: '',
    notes: '',
    lignes: []
  };

  newLine: LigneFactureRequest = {
    produitId: 0,
    designation: '',
    quantite: 1,
    prixUnitaire: 0,
    remisePourcentage: 0,
    remiseMontant: 0
  };

  showProductSearch: boolean = false;
  productSearchTerm: string = '';
  selectedProduit: Produit | null = null;
  modeLibre: boolean = false;
  ligneLibre: LigneFactureRequest = { produitId: 0, designation: '', quantite: 1, prixUnitaire: 0, remisePourcentage: 0, remiseMontant: 0 };

  showClientSearch: boolean = false;
  clientSearchTerm: string = '';
  selectedClient: Client | null = null;
  creerNouveauClient: boolean = false;
  nouveauClient: Partial<Client> = { nom: '', prenom: '', numeroTelephone: '' };

  showRemiseGlobale: boolean = false;
  remiseGlobale: number = 0;
  typeRemiseGlobale: FactureRemiseType = FactureRemiseType.POURCENTAGE;

  showCreateModal: boolean = false;
  showDetailModal: boolean = false;
  showEditModal: boolean = false;


  private subscriptions: Subscription[] = [];

  FactureRemiseType = FactureRemiseType;
  FactureStatut = FactureStatut;

  constructor(
    private factureService: FactureService,
    private authService: AuthService,
    private clientService: ClientService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.initDates();
    this.loadData();
    this.loadClients();
    this.loadProduits();
    this.subscribeToUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToUser(): void {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) this.factureForm.utilisateurId = user.id;
      })
    );
  }

  initDates(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.dateDebut = this.formatDateInput(firstDay);
    this.dateFin = this.formatDateInput(today);
  }

  formatDateInput(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  loadData(): void {
    this.isLoading = true;
    if (this.dateDebut && this.dateFin && this.dateDebut !== this.dateFin) {
      this.loadByPeriod();
    } else if (this.statutFilter) {
      this.loadByStatus();
    } else {
      this.loadAll();
    }
    this.loadStats();
  }

  loadAll(): void {
    this.factureService.obtenirToutesFactures().subscribe({
      next: (data) => { this.factures = data; this.isLoading = false; },
      error: (err) => { this.errorMessage = err.message; this.isLoading = false; setTimeout(() => this.errorMessage = '', 5000); }
    });
  }

  loadByStatus(): void {
    this.factureService.obtenirFacturesParStatut(this.statutFilter).subscribe({
      next: (data) => { this.factures = data; this.isLoading = false; },
      error: (err) => { this.errorMessage = err.message; this.isLoading = false; }
    });
  }

  loadByPeriod(): void {
    this.factureService.obtenirFacturesParPeriode(this.dateDebut, this.dateFin).subscribe({
      next: (data) => { this.factures = data; this.isLoading = false; },
      error: (err) => { this.errorMessage = err.message; this.isLoading = false; }
    });
  }

  loadStats(): void {
    this.factureService.getStatistiques().subscribe({
      next: (stats) => this.statistiques = stats,
      error: (err) => console.error(err)
    });
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (clients) => this.clients = clients || [],
      error: (err) => console.error(err)
    });
  }

  loadProduits(): void {
    this.productService.getProducts().subscribe({
      next: (produits) => { this.produits = produits; this.filteredProduits = produits; },
      error: (err) => console.error(err)
    });
  }


  // Méthodes existantes pour la gestion des factures (inchangées)
  searchProduits(): void {
    if (this.productSearchTerm.length >= 2) {
      this.filteredProduits = this.produits.filter(p =>
        p.nom.toLowerCase().includes(this.productSearchTerm.toLowerCase()) ||
        (p.codeBarre && p.codeBarre.includes(this.productSearchTerm))
      );
    } else if (this.productSearchTerm.length === 0) this.filteredProduits = this.produits;
  }

  selectProduit(produit: Produit): void {
    this.selectedProduit = produit;
    this.newLine.produitId = produit.id;
    this.newLine.designation = produit.nom;
    this.newLine.prixUnitaire = produit.prixVente;
    this.showProductSearch = false;
    this.productSearchTerm = '';
  }

  searchClients(): void {
    if (this.clientSearchTerm.length >= 2) {
      this.clientService.search(this.clientSearchTerm).subscribe({
        next: (clients) => this.filteredClients = clients,
        error: (err) => console.error(err)
      });
    } else if (this.clientSearchTerm.length === 0) this.filteredClients = this.clients;
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.factureForm.clientNom = client.nom;
    this.factureForm.clientPrenom = client.prenom;
    this.factureForm.clientTelephone = client.numeroTelephone || client.telephone;
    this.factureForm.clientAdresse = client.adresse;
    this.factureForm.clientId = client.id;
    this.creerNouveauClient = false;
    this.showClientSearch = false;
    this.clientSearchTerm = '';
  }

  selectClientDivers(): void {
    this.selectedClient = null;
    this.factureForm.clientNom = '';
    this.factureForm.clientPrenom = '';
    this.factureForm.clientTelephone = '';
    this.factureForm.clientAdresse = '';
    this.factureForm.clientId = undefined;
    this.creerNouveauClient = false;
    this.showClientSearch = false;
  }

  creerClient(): void {
    if (!this.nouveauClient.nom) { this.errorMessage = 'Nom requis'; return; }
    if (!this.nouveauClient.numeroTelephone && !this.nouveauClient.telephone) { this.errorMessage = 'Téléphone requis'; return; }

    this.isSaving = true;
    const clientData: Client = {
      id: 0,
      nom: this.nouveauClient.nom,
      prenom: this.nouveauClient.prenom || '',
      numeroTelephone: this.nouveauClient.numeroTelephone || this.nouveauClient.telephone || '',
      adresse: this.nouveauClient.adresse || '',
      email: this.nouveauClient.email || '',
      dateCreation: new Date().toISOString()
    };

    this.clientService.create(clientData).subscribe({
      next: (client) => {
        this.selectClient(client);
        this.loadClients();
        this.successMessage = 'Client créé';
        this.isSaving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isSaving = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  toggleModeLibre(): void {
    this.modeLibre = !this.modeLibre;
    this.selectedProduit = null;
    this.showProductSearch = false;
    this.productSearchTerm = '';
    this.ligneLibre = { produitId: 0, designation: '', quantite: 1, prixUnitaire: 0, remisePourcentage: 0, remiseMontant: 0 };
  }

  addLine(): void {
    if (this.modeLibre) {
      if (!this.ligneLibre.designation?.trim()) { this.errorMessage = 'Désignation requise'; setTimeout(() => this.errorMessage = '', 3000); return; }
      if (!this.ligneLibre.quantite || this.ligneLibre.quantite < 1) { this.errorMessage = 'Quantité ≥ 1'; return; }
      if (!this.ligneLibre.prixUnitaire || this.ligneLibre.prixUnitaire <= 0) { this.errorMessage = 'Prix unitaire invalide'; return; }
      this.factureForm.lignes.push({
        produitId: undefined as any,
        designation: this.ligneLibre.designation,
        quantite: this.ligneLibre.quantite,
        prixUnitaire: this.ligneLibre.prixUnitaire,
        remisePourcentage: this.ligneLibre.remisePourcentage || 0,
        remiseMontant: this.ligneLibre.remiseMontant || 0
      });
      this.ligneLibre = { produitId: 0, designation: '', quantite: 1, prixUnitaire: 0, remisePourcentage: 0, remiseMontant: 0 };
    } else {
      if (!this.selectedProduit) { this.errorMessage = 'Veuillez sélectionner un produit'; setTimeout(() => this.errorMessage = '', 3000); return; }
      if (this.newLine.quantite < 1) { this.errorMessage = 'Quantité ≥ 1'; return; }
      if (this.newLine.prixUnitaire <= 0) { this.errorMessage = 'Prix unitaire invalide'; return; }
      this.factureForm.lignes.push({
        produitId: this.selectedProduit.id,
        designation: this.newLine.designation || this.selectedProduit.nom,
        quantite: this.newLine.quantite,
        prixUnitaire: this.newLine.prixUnitaire,
        remisePourcentage: this.newLine.remisePourcentage || 0,
        remiseMontant: this.newLine.remiseMontant || 0
      });
      this.newLine = { produitId: 0, designation: '', quantite: 1, prixUnitaire: 0, remisePourcentage: 0, remiseMontant: 0 };
      this.selectedProduit = null;
      this.showProductSearch = false;
      this.productSearchTerm = '';
    }
  }

  removeLine(index: number): void {
    this.factureForm.lignes.splice(index, 1);
  }

  openCreateModal(): void {
    this.resetForm();
    this.showCreateModal = true;
  }

  createFacture(): void {
    this.errorMessage = '';
    if (!this.factureForm.clientNom?.trim() && !this.selectedClient) {
      this.errorMessage = 'Nom client requis';
      return;
    }
    if (this.factureForm.lignes.length === 0) {
      this.errorMessage = 'Au moins un article requis';
      return;
    }

    const clientLabel = this.selectedClient?.nom || this.factureForm.clientNom || 'Client divers';
    const total = this.getTotalAvecRemiseGlobale();
    Swal.fire({
      title: 'Créer cette facture ?',
      html: `<div class="text-start">
               <p><strong>Client :</strong> ${clientLabel}</p>
               <p><strong>Articles :</strong> ${this.factureForm.lignes.length}</p>
               <p><strong>Total :</strong> ${this.formatPrice(total)}</p>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, créer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isSaving = true;
      this._doCreateFacture();
    });
  }

  private _doCreateFacture(): void {
    const request: FactureRequest = {
      clientNom: this.factureForm.clientNom,
      clientPrenom: this.factureForm.clientPrenom,
      clientTelephone: this.factureForm.clientTelephone,
      clientAdresse: this.factureForm.clientAdresse,
      clientId: this.selectedClient?.id,
      notes: this.factureForm.notes,
      utilisateurId: this.currentUser?.id,
      lignes: this.factureForm.lignes.map(l => ({
        produitId: l.produitId,
        designation: l.designation,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        remisePourcentage: l.remisePourcentage,
        remiseMontant: l.remiseMontant
      }))
    };
    if (this.showRemiseGlobale && this.remiseGlobale > 0) {
      request.remiseGlobale = this.remiseGlobale;
      request.typeRemiseGlobale = this.typeRemiseGlobale;
    }

    this.factureService.creerFacture(request).subscribe({
      next: () => {
        this.successMessage = 'Facture créée';
        this.resetForm();
        this.loadData();
        this.showCreateModal = false;
        this.isSaving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isSaving = false;
      }
    });
  }

  openEditModal(facture: Facture): void {
    this.selectedFacture = facture;
    this.factureForm = {
      clientNom: facture.clientNom || '',
      clientPrenom: facture.clientPrenom || '',
      clientTelephone: facture.clientTelephone || '',
      clientAdresse: facture.clientAdresse || '',
      notes: facture.notes || '',
      clientId: facture.clientId,
      lignes: facture.lignes.map(l => ({
        produitId: l.produitId || 0,
        designation: l.designation,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        remisePourcentage: l.remisePourcentage || 0,
        remiseMontant: l.remiseMontant || 0
      }))
    };
    if (facture.clientId) {
      this.selectedClient = {
        id: facture.clientId,
        nom: facture.clientNom || '',
        prenom: facture.clientPrenom || '',
        numeroTelephone: facture.clientTelephone || '',
        adresse: facture.clientAdresse || '',
        email: '',
        dateCreation: ''
      };
    } else {
      this.selectedClient = null;
    }
    if (facture.remiseGlobale && facture.remiseGlobale > 0) {
      this.showRemiseGlobale = true;
      this.remiseGlobale = facture.remiseGlobale;
      this.typeRemiseGlobale = facture.typeRemiseGlobale || FactureRemiseType.POURCENTAGE;
    } else {
      this.showRemiseGlobale = false;
      this.remiseGlobale = 0;
    }
    this.showEditModal = true;
  }

  modifierFacture(): void {
    if (!this.selectedFacture?.id) return;
    if (this.factureForm.lignes.length === 0) {
      this.errorMessage = 'Au moins un article';
      return;
    }

    const clientLabel = this.selectedClient?.nom || this.factureForm.clientNom || 'Client divers';
    const total = this.getTotalAvecRemiseGlobale();
    Swal.fire({
      title: 'Modifier cette facture ?',
      html: `<div class="text-start">
               <p><strong>Facture :</strong> ${this.selectedFacture.numeroFacture}</p>
               <p><strong>Client :</strong> ${clientLabel}</p>
               <p><strong>Nouveau total :</strong> ${this.formatPrice(total)}</p>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isSaving = true;
      this._doModifierFacture();
    });
  }

  private _doModifierFacture(): void {
    const request: FactureRequest = {
      clientNom: this.factureForm.clientNom,
      clientPrenom: this.factureForm.clientPrenom,
      clientTelephone: this.factureForm.clientTelephone,
      clientAdresse: this.factureForm.clientAdresse,
      clientId: this.selectedClient?.id,
      notes: this.factureForm.notes,
      utilisateurId: this.currentUser?.id,
      lignes: this.factureForm.lignes.map(l => ({
        produitId: l.produitId,
        designation: l.designation,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        remisePourcentage: l.remisePourcentage,
        remiseMontant: l.remiseMontant
      }))
    };
    if (this.showRemiseGlobale && this.remiseGlobale > 0) {
      request.remiseGlobale = this.remiseGlobale;
      request.typeRemiseGlobale = this.typeRemiseGlobale;
    }

    this.factureService.modifierFacture(this.selectedFacture!.id, request).subscribe({
      next: () => {
        this.successMessage = 'Facture modifiée';
        this.resetForm();
        this.loadData();
        this.showEditModal = false;
        this.isSaving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isSaving = false;
      }
    });
  }

  viewFacture(facture: Facture): void {
    this.selectedFacture = facture;
    this.showDetailModal = true;
  }

  imprimerFacture(facture: Facture): void { this.factureService.imprimerFacture(facture); }
  exportFacturePDF(facture: Facture): void { this.factureService.exportFactureToPDF(facture); }
  ouvrirPdfServeur(facture: Facture): void { window.open('/api/caisse/factures/' + facture.id + '/pdf/view', '_blank'); }
  telechargerPdfServeur(facture: Facture): void { window.open('/api/caisse/factures/' + facture.id + '/pdf', '_blank'); }
  getQrCodeUrl(facture: Facture): string { return '/api/caisse/factures/' + facture.id + '/qrcode'; }

  validerFacture(facture: Facture): void {
    Swal.fire({
      title: 'Valider la facture ?',
      text: `La facture ${facture.numeroFacture} sera marquée comme validée.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isLoading = true;
      this.factureService.validerFacture(facture.id).subscribe({
        next: () => { this.successMessage = 'Facture validée'; this.loadData(); this.isLoading = false; },
        error: (err) => { this.errorMessage = err.message; this.isLoading = false; }
      });
    });
  }

  annulerFacture(facture: Facture): void {
    Swal.fire({
      title: 'Annuler la facture ?',
      text: `La facture ${facture.numeroFacture} sera annulée. Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isLoading = true;
      this.factureService.annulerFacture(facture.id).subscribe({
        next: () => { this.successMessage = 'Facture annulée'; this.loadData(); this.isLoading = false; },
        error: (err) => { this.errorMessage = err.message; this.isLoading = false; }
      });
    });
  }

  supprimerFacture(facture: Facture): void {
    Swal.fire({
      title: 'Supprimer la facture ?',
      html: `La facture <strong>${facture.numeroFacture}</strong> sera supprimée définitivement.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isLoading = true;
      this.factureService.supprimerFacture(facture.id).subscribe({
        next: () => {
          this.successMessage = 'Facture supprimée';
          this.loadData();
          this.isLoading = false;
          if (this.selectedFacture?.id === facture.id) this.closeAllModals();
        },
        error: (err) => { this.errorMessage = err.message; this.isLoading = false; }
      });
    });
  }

  applyFilters(): void { this.currentPage = 1; this.loadData(); }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.statutFilter = '';
    this.initDates();
    this.currentPage = 1;
    this.loadData();
  }

  get filteredFactures(): Facture[] {
    let filtered = [...this.factures];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.numeroFacture.toLowerCase().includes(term) ||
        (f.clientNom?.toLowerCase() || '').includes(term) ||
        (f.clientTelephone?.toLowerCase() || '').includes(term)
      );
    }
    return filtered;
  }

  get paginatedFactures(): Facture[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFactures.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number { return Math.ceil(this.filteredFactures.length / this.itemsPerPage); }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  changePage(page: number): void { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }

  resetForm(): void {
    this.selectedFacture = null;
    this.selectedClient = null;
    this.selectedProduit = null;
    this.factureForm = { clientNom: '', clientPrenom: '', clientTelephone: '', clientAdresse: '', notes: '', lignes: [] };
    this.newLine = { produitId: 0, designation: '', quantite: 1, prixUnitaire: 0, remisePourcentage: 0, remiseMontant: 0 };
    this.ligneLibre = { produitId: 0, designation: '', quantite: 1, prixUnitaire: 0, remisePourcentage: 0, remiseMontant: 0 };
    this.modeLibre = false;
    this.showRemiseGlobale = false;
    this.remiseGlobale = 0;
    this.typeRemiseGlobale = FactureRemiseType.POURCENTAGE;
    this.showClientSearch = false;
    this.showProductSearch = false;
    this.creerNouveauClient = false;
    this.nouveauClient = { nom: '', prenom: '', numeroTelephone: '' };
    this.productSearchTerm = '';
    this.clientSearchTerm = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeAllModals(): void {
    this.showCreateModal = false;
    this.showDetailModal = false;
    this.showEditModal = false;
    this.selectedFacture = null;
    this.resetForm();
  }

  getTotalAvecRemiseGlobale(): number {
    let total = 0;
    for (const l of this.factureForm.lignes) { total += l.prixUnitaire * l.quantite; }
    if (!this.showRemiseGlobale || this.remiseGlobale <= 0) return total;
    if (this.typeRemiseGlobale === FactureRemiseType.POURCENTAGE) {
      return total * (1 - this.remiseGlobale / 100);
    } else {
      return Math.max(0, total - this.remiseGlobale);
    }
  }


  // ==================== UTILITAIRES ====================
  formatPrice(price: number): string { return this.factureService.formatPrice(price); }
  formatDateShort(date: string): string { return this.factureService.formatDateShort(date); }
  getStatusBadgeClass(statut: string): string { return this.factureService.getStatutClass(statut); }
  getStatusText(statut: string): string { return this.factureService.getStatutText(statut); }
  getStatutOptions(): { value: string; label: string }[] { return this.factureService.getStatutOptions(); }
  get isAdmin(): boolean { return this.authService.isAdmin(); }
}