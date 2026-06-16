import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { WebSocketService } from '../../../shared/services/websocket.service';
import {
  VenteService,
  VenteMap,
  Client,
  ModePaiement,
  VenteRequest,
  LigneVenteRequest,
  VenteCreditRequest,
  ReglementCreditRequest,
  RemiseType,
  Statistiques,
  StatistiquesCredits,
  VentesDuJourResponse,
  VentesParTypeResponse,
  CreditsNonReglesResponse,
  CreditsEnRetardResponse
} from '../../../shared/services/vente.service';
import { ProductService, Produit, RetourVenteRequest, RetourVente, Categorie } from '../../../shared/services/product.service';
import { AuthService, User } from '../../../shared/services/auth.service';
import { ClientService } from '../../../shared/services/client.service';

@Component({
  selector: 'app-ventes',
  templateUrl: './ventes.component.html',
  styleUrls: ['./ventes.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class VentesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modalBackdrop') modalBackdrop!: ElementRef;

  // ==================== DONNÉES ====================
  ventes: VenteMap[] = [];
  ventesDuJour: VenteMap[] = [];

  // TABLEAUX SÉPARÉS
  ventesComptant: VenteMap[] = [];
  ventesCredit: VenteMap[] = [];

  produits: Produit[] = [];
  allProduits: Produit[] = [];
  clients: Client[] = [];
  clientsFiltres: Client[] = [];
  categories: Categorie[] = [];

  statistiques: Statistiques | null = null;
  statistiquesCredits: StatistiquesCredits | null = null;
  creditsNonRegles: VenteMap[] = [];
  creditsEnRetard: VenteMap[] = [];
  creditsReglesAujourdhui: VenteMap[] = [];
  situationCreditClient: any | null = null;
  historiqueReglements: any[] = [];

  // ==================== REVENUS/BENEFICES ====================
  chiffreAffaireTotal: number = 0;
  beneficeTotal: number = 0;
  margeMoyenne: number = 0;
  chiffreAffaireJour: number = 0;
  beneficeJour: number = 0;
  margeJour: number = 0;

  // ==================== FILTRES ====================
  searchTerm: string = '';
  searchClientTerm: string = '';
  modePaiementFilter: string = '';
  typeVenteFilter: string = '';
  dateDebut: string = '';
  dateFin: string = '';
  heureDebut: string = '';
  heureFin: string = '';
  showTodayOnly: boolean = false;
  showAnnulees: boolean = false;
  showRetournees: boolean = false;

  // ==================== FILTRE CATEGORIE ====================
  selectedCategorieId: number | null = null;

  // ==================== PAGINATION ====================
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // ==================== ÉTATS ====================
  isLoading: boolean = false;
  isLoadingStats: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // ==================== DROPDOWNS ====================
  showExportDropdown: boolean = false;
  showOptionsDropdown: boolean = false;

  // ==================== FORMULAIRES ====================
  venteForm: VenteRequest = {
    vendeurId: 0,
    lignes: [],
    modePaiement: ModePaiement.ESPECES,
    referencePaiement: '',
    estCredit: false,
    clientDivers: true,
    clientId: undefined
  };

  creditForm: VenteCreditRequest = {
    vendeurId: 0,
    lignes: [],
    modePaiement: ModePaiement.ESPECES,
    referencePaiement: '',
    estCredit: true,
    clientNom: '',
    clientPrenom: '',
    clientTelephone: '',
    dateEcheance: '',
    montantVerse: 0
  };

  reglementForm: ReglementCreditRequest = {
    venteId: 0,
    montantRegle: 0,
    utilisateurId: 0,
    modePaiement: ModePaiement.ESPECES,
    referencePaiement: '',
    dateReglement: new Date().toISOString().split('T')[0]
  };

  nouveauClientForm: Partial<Client> = {
    nom: '',
    prenom: '',
    numeroTelephone: '',
    adresse: '',
    email: ''
  };

  clientSearchForm = {
    nom: '',
    telephone: ''
  };

  // ==================== CLIENT SELECTION ====================
  clientSelectionne: Client | null = null;
  showClientSearch: boolean = false;
  showNewClientForm: boolean = false;

  // ==================== EXPORT CLIENT ====================
  selectedClientForExport: Client | null = null;
  showClientExportSelector: boolean = false;

  // ==================== MODIFICATION ====================
  venteAModifier: VenteMap | null = null;
  isModificationCredit: boolean = false;

  // ==================== REMISES ====================
  showRemiseGlobale: boolean = false;
  remiseGlobale: number = 0;
  typeRemiseGlobale: RemiseType = RemiseType.POURCENTAGE;
  lignesAvecRemise: Map<number, { type: RemiseType, valeur: number }> = new Map();

  // ==================== MODALES ====================
  showNewVenteModal: boolean = false;
  showNewVenteCreditModal: boolean = false;
  showVenteDetailModal: boolean = false;
  showStatsModal: boolean = false;
  showModifierVenteModal: boolean = false;
  showCreditsModal: boolean = false;
  showReglementCreditModal: boolean = false;
  showStatsCreditsModal: boolean = false;
  showSearchClientModal: boolean = false;
  showClientSituationModal: boolean = false;
  showAnnulationModal: boolean = false;
  showClientSelectorModal: boolean = false;
  showHistoriqueReglementsModal: boolean = false;
  showModificationLignesModal: boolean = false;

  // Modification lignes
  modificationLignes: Array<{
    produitId: number;
    produitNom: string;
    prixUnitaire: number;
    quantite: number;
    ancienProduitId?: number;
  }> = [];
  modificationMotif: string = '';
  isModificationLoading: boolean = false;

  // ==================== RETOUR VENTE ====================
  showRetourVenteModal: boolean = false;
  selectedVentePourRetour: VenteMap | null = null;
  retourVenteLignes: {
    ligneVenteId: number;
    produitId: number;
    produitNom: string;
    prixUnitaire: number;
    quantiteMax: number;
    quantiteRetournee: number;
    selected: boolean;
  }[] = [];
  retourVenteMotif: string = '';

  // ==================== MODAL FACTURE DATE ====================
  showFactureDateModal: boolean = false;
  factureDateCustom: string = '';
  venteForFacture: VenteMap | null = null;

  selectedVente: VenteMap | null = null;
  selectedCredit: VenteMap | null = null;
  creditDetailVente: VenteMap | null = null;

  annulationForm: {
    motif: string;
    venteId: number;
    venteNumero: string;
  } = {
    motif: '',
    venteId: 0,
    venteNumero: ''
  };

  // ==================== PANIER ====================
  produitsPanier: Array<{
    id: number;
    nom: string;
    prixAchat: number;
    prixVente: number;
    prixModifie: number;
    quantite: number;
    quantiteDisponible: number;
    codeBarre?: string;
    modifierPrix: boolean;
    categorie?: Categorie;
  }> = [];

  searchProduit: string = '';

  // ==================== UTILISATEUR ====================
  currentUser: User | null = null;

  // ==================== DATES ====================
  today: string = new Date().toISOString().split('T')[0];

  // ==================== SOUSCRIPTIONS ====================
  private subscriptions: Subscription[] = [];
  private keydownHandler: any = null;

  ModePaiementEnum = ModePaiement;
  RemiseTypeEnum = RemiseType;

  // ==================== AVANCES ====================
  soldeAvanceClient: number = 0;
  utiliserAvance: boolean = false;
  montantAvanceAUtiliser: number = 0;
  isLoadingAvance: boolean = false;

  constructor(
    private venteService: VenteService,
    private productService: ProductService,
    private authService: AuthService,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private clientService: ClientService,
    private ws: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadProduits();
    this.loadCategories();
    this.loadClients();
    this.subscribeToUser();

    // Temps réel : rafraîchir automatiquement à chaque nouvelle vente / règlement
    const wsSub = this.ws.subscribeTopic('/topic/ventes').subscribe(() => {
      this.loadData();
    });
    this.subscriptions.push(wsSub);
  }

  ngAfterViewInit(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeAllDropdowns();
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  // ==================== GESTION DROPDOWNS ====================

  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
    if (this.showExportDropdown) {
      this.showOptionsDropdown = false;
    }
  }

  toggleOptionsDropdown(): void {
    this.showOptionsDropdown = !this.showOptionsDropdown;
    if (this.showOptionsDropdown) {
      this.showExportDropdown = false;
    }
  }

  closeExportDropdown(): void {
    this.showExportDropdown = false;
  }

  closeOptionsDropdown(): void {
    this.showOptionsDropdown = false;
  }

  closeAllDropdowns(): void {
    this.showExportDropdown = false;
    this.showOptionsDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.dropdown-menu-custom')) {
      this.closeAllDropdowns();
    }
  }

  private focusWhenAvailable(selector: string, attempts: number = 8, delayMs: number = 50): void {
    let tries = 0;
    const tryFocus = () => {
      try {
        const el = this.elementRef?.nativeElement?.querySelector(selector) || document.querySelector(selector);
        if (el && typeof (el as HTMLElement).focus === 'function') {
          (el as HTMLElement).focus();
          return;
        }
      } catch (e) {}
      tries++;
      if (tries < attempts) {
        setTimeout(tryFocus, delayMs);
      }
    };
    setTimeout(tryFocus, 0);
  }

  // ==================== INITIALISATION ====================

  subscribeToUser(): void {
    const userSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user) {
          this.venteForm.vendeurId = user.id;
          this.creditForm.vendeurId = user.id;
          this.reglementForm.utilisateurId = user.id;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    });
    this.subscriptions.push(userSub);
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.showTodayOnly) {
      this.loadVentesDuJour();
    } else {
      this.loadAllVentes();
    }

    if (this.isAdmin) {
      this.loadStatistics();
      this.loadCreditsData();
    }
  }

  loadVentesDuJour(): void {
    this.venteService.getVentesDuJour().subscribe({
      next: (response: VentesDuJourResponse) => {
        this.ventesDuJour = response.ventes || [];
        this.ventes = response.ventes || [];
        this.separerVentesParType();
        this.calculerRevenus();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllVentes(): void {
    this.venteService.getVentesParType().subscribe({
      next: (response: VentesParTypeResponse) => {
        this.ventes = response.toutes || [];
        this.ventesComptant = response.comptant || [];
        this.ventesCredit = response.credit || [];
        this.calculerRevenus();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  separerVentesParType(): void {
    this.ventesComptant = this.ventes.filter(v => !v.estCredit);
    this.ventesCredit = this.ventes.filter(v => v.estCredit);
  }

  calculerRevenus(): void {
    // Calcul du CA total
    this.chiffreAffaireTotal = this.ventes.reduce((sum, v) => sum + v.montantTotal, 0);
    this.beneficeTotal = 0;

    for (const vente of this.ventes) {
      if (vente.produits && vente.produits.length > 0) {
        for (const produit of vente.produits) {
          const produitId = produit.produitId;
          const produitComplet = this.produits.find(p => p.id === produitId);
          if (produitComplet && produitComplet.prixAchat) {
            const beneficeProduit = (produit.prixUnitaire - produitComplet.prixAchat) * produit.quantite;
            this.beneficeTotal += beneficeProduit;
          }
        }
      }
    }

    this.margeMoyenne = this.chiffreAffaireTotal > 0 ? (this.beneficeTotal / this.chiffreAffaireTotal) * 100 : 0;

    // Calcul du jour
    const aujourdhui = new Date().toISOString().split('T')[0];
    const ventesAujourdhui = this.ventes.filter(v => v.dateVente?.startsWith(aujourdhui));
    this.chiffreAffaireJour = ventesAujourdhui.reduce((sum, v) => sum + v.montantTotal, 0);
    this.beneficeJour = 0;

    for (const vente of ventesAujourdhui) {
      if (vente.produits && vente.produits.length > 0) {
        for (const produit of vente.produits) {
          const produitId = produit.produitId;
          const produitComplet = this.produits.find(p => p.id === produitId);
          if (produitComplet && produitComplet.prixAchat) {
            this.beneficeJour += (produit.prixUnitaire - produitComplet.prixAchat) * produit.quantite;
          }
        }
      }
    }

    this.margeJour = this.chiffreAffaireJour > 0 ? (this.beneficeJour / this.chiffreAffaireJour) * 100 : 0;

    this.cdr.detectChanges();
  }

  // ==================== MÉTHODES DE DÉTECTION PERTE/BÉNÉFICE ====================

  calculerBeneficeTotal(ventesListe: VenteMap[]): number {
    let benefice = 0;
    for (const vente of ventesListe) {
      benefice += this.getVenteBenefice(vente);
    }
    return benefice;
  }

  getVenteBenefice(vente: VenteMap): number {
    let benefice = 0;
    if (vente.produits && vente.produits.length > 0) {
      for (const produit of vente.produits) {
        benefice += this.getProduitBenefice(produit, vente);
      }
    }
    return benefice;
  }

  getVenteMarge(vente: VenteMap): number {
    const benefice = this.getVenteBenefice(vente);
    if (vente.montantTotal === 0) return 0;
    return (benefice / vente.montantTotal) * 100;
  }

  getProduitBenefice(produit: any, vente: VenteMap): number {
    const produitId = produit.produitId;
    const produitComplet = this.produits.find(p => p.id === produitId);
    if (!produitComplet || !produitComplet.prixAchat) return 0;
    const prixVenteApresRemise = produit.prixApresRemise || produit.prixUnitaire || produit.prixVente || 0;
    const beneficeUnitaire = prixVenteApresRemise - produitComplet.prixAchat;
    return beneficeUnitaire * produit.quantite;
  }

  getProduitPrixAchat(produitId: number): number {
    const produit = this.produits.find(p => p.id === produitId);
    return produit?.prixAchat || 0;
  }

  isVenteEnPerte(vente: VenteMap): boolean {
    return this.getVenteBenefice(vente) < 0;
  }

  getBeneficeProduitPanier(index: number): number {
    const produit = this.produitsPanier[index];
    if (!produit) return 0;
    const prixVente = this.getPrixApresRemise(index);
    const beneficeUnitaire = prixVente - produit.prixAchat;
    return beneficeUnitaire * produit.quantite;
  }

  isProduitPanierEnPerte(index: number): boolean {
    const produit = this.produitsPanier[index];
    if (!produit) return false;
    const prixVente = this.getPrixApresRemise(index);
    return prixVente < produit.prixAchat;
  }

  isPanierEnPerte(): boolean {
    return this.getBeneficeTotalPanier() < 0;
  }

  getBeneficeTotal(): number {
    return this.beneficeTotal;
  }

  getMargeTotale(): number {
    return this.margeMoyenne;
  }

  getBeneficeColorClass(benefice: number): string {
    if (benefice > 0) return 'text-success';
    if (benefice < 0) return 'text-danger';
    return 'text-muted';
  }

  getBeneficeIcon(benefice: number): string {
    if (benefice > 0) return 'fa-arrow-up';
    if (benefice < 0) return 'fa-arrow-down';
    return 'fa-minus';
  }

  getBeneficeLabel(benefice: number): string {
    if (benefice > 0) return 'Bénéfice';
    if (benefice < 0) return 'Perte';
    return 'Équilibre';
  }

  isPrixVenteInférieurPrixAchat(index: number): boolean {
    const produit = this.produitsPanier[index];
    if (!produit) return false;
    const prixVente = produit.modifierPrix ? produit.prixModifie : produit.prixVente;
    return prixVente < produit.prixAchat;
  }

  getDifferencePrixProduitPanier(index: number): number {
    const produit = this.produitsPanier[index];
    if (!produit) return 0;
    const prixVente = produit.modifierPrix ? produit.prixModifie : produit.prixVente;
    return prixVente - produit.prixAchat;
  }

  loadProduits(): void {
    this.productService.getProducts().subscribe({
      next: (produits: Produit[]) => {
        this.allProduits = produits || [];
        this.produits = (produits || []).filter(p => p.quantite > 0);
        this.calculerRevenus();
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des produits:', error);
      }
    });
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (categories: Categorie[]) => {
        this.categories = categories || [];
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    });
  }

  loadClients(): void {
    this.venteService.getClients().subscribe({
      next: (clients: Client[]) => {
        this.clients = clients || [];
        this.clientsFiltres = [...this.clients];
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des clients:', error);
      }
    });
  }

  loadStatistics(): void {
    this.isLoadingStats = true;
    this.venteService.getStatistiquesChiffreAffaire().subscribe({
      next: (stats: Statistiques) => {
        this.statistiques = stats;
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.isLoadingStats = false;
      }
    });
  }

  loadCreditsData(): void {
    this.loadCreditsNonRegles();
    this.loadCreditsEnRetard();
    this.loadStatistiquesCredits();
  }

  loadCreditsNonRegles(): void {
    this.venteService.getCreditsNonRegles().subscribe({
      next: (response: CreditsNonReglesResponse) => {
        this.creditsNonRegles = response.credits || [];
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des crédits non réglés:', error);
      }
    });
  }

  loadCreditsEnRetard(): void {
    this.venteService.getCreditsEnRetard().subscribe({
      next: (response: CreditsEnRetardResponse) => {
        this.creditsEnRetard = response.credits || [];
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des crédits en retard:', error);
      }
    });
  }

  loadStatistiquesCredits(): void {
    this.venteService.getStatistiquesCredits().subscribe({
      next: (stats: StatistiquesCredits) => {
        this.statistiquesCredits = stats;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des statistiques crédits:', error);
      }
    });
  }

  // ==================== GESTION CLIENTS ====================

  rechercherClients(): void {
    const nom = (this.clientSearchForm.nom || this.searchClientTerm || '').trim().toLowerCase();
    const tel = (this.clientSearchForm.telephone || '').trim().toLowerCase();
    if (!nom && !tel) {
      this.clientsFiltres = [...this.clients];
    } else {
      this.clientsFiltres = this.clients.filter(c => {
        const nomMatch = nom ? (
          (c.nom || '').toLowerCase().includes(nom) ||
          (c.prenom || '').toLowerCase().includes(nom)
        ) : false;
        const telMatch = tel ? (c.numeroTelephone || '').toLowerCase().includes(tel) : false;
        return nomMatch || telMatch;
      });
    }
    this.cdr.detectChanges();
  }

  selectionnerClient(client: Client): void {
    this.clientSelectionne = client;
    this.venteForm.clientId = client.id;
    this.venteForm.clientDivers = false;
    this.venteForm.clientNom = client.nom;
    this.venteForm.clientPrenom = client.prenom;
    this.venteForm.clientTelephone = client.numeroTelephone;

    this.creditForm.clientNom = client.nom;
    this.creditForm.clientPrenom = client.prenom;
    this.creditForm.clientTelephone = client.numeroTelephone;

    this.showClientSelectorModal = false;
    this.showNewClientForm = false;
    this.successMessage = `Client sélectionné: ${client.nom} ${client.prenom}`;
    this.cdr.detectChanges();
    setTimeout(() => this.successMessage = '', 3000);

    // Charger le solde d'avance du client
    this.soldeAvanceClient = 0;
    this.utiliserAvance = false;
    this.montantAvanceAUtiliser = 0;
    if (client.nom) {
      this.isLoadingAvance = true;
      this.clientService.getSoldeAvance(client.nom, client.numeroTelephone).subscribe({
        next: (res) => {
          this.soldeAvanceClient = res.soldeDisponible || 0;
          this.isLoadingAvance = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.soldeAvanceClient = 0;
          this.isLoadingAvance = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  utiliserClientDivers(): void {
    this.clientSelectionne = null;
    this.venteForm.clientId = undefined;
    this.venteForm.clientDivers = true;
    this.venteForm.clientNom = '';
    this.venteForm.clientPrenom = '';
    this.venteForm.clientTelephone = '';
    this.showClientSelectorModal = false;
    this.cdr.detectChanges();
  }

  ouvrirFormulaireNouveauClient(): void {
    this.nouveauClientForm = {
      nom: '',
      prenom: '',
      numeroTelephone: '',
      adresse: '',
      email: ''
    };
    this.showNewClientForm = true;
    this.cdr.detectChanges();
  }

  creerNouveauClient(): void {
    if (!this.nouveauClientForm.nom || !this.nouveauClientForm.numeroTelephone) {
      this.errorMessage = 'Le nom et le téléphone sont requis';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    this.venteService.createClient(this.nouveauClientForm).subscribe({
      next: (client: Client) => {
        this.successMessage = `Client ${client.nom} créé avec succès!`;
        this.clients.push(client);
        this.selectionnerClient(client);
        this.showNewClientForm = false;
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ==================== OUVERTURE DES MODALES ====================

  openNewVenteModal(): void {
    if (!this.currentUser || this.currentUser.id <= 0) {
      this.errorMessage = 'Impossible d\'identifier l\'utilisateur.';
      this.cdr.detectChanges();
      return;
    }

    this.resetForms();
    this.selectedCategorieId = null;
    this.searchProduit = '';
    this.venteForm.modePaiement = ModePaiement.ESPECES;
    this.venteForm.estCredit = false;
    this.venteForm.clientDivers = true;
    this.clientSelectionne = null;
    this.showNewVenteModal = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.focusWhenAvailable('#searchProduitInput');
    }, 100);
  }

  openNewVenteCreditModal(): void {
    if (!this.currentUser || this.currentUser.id <= 0) {
      this.errorMessage = 'Impossible d\'identifier l\'utilisateur.';
      this.cdr.detectChanges();
      return;
    }

    this.resetForms();
    this.selectedCategorieId = null;
    this.searchProduit = '';
    this.clientSelectionne = null;
    this.creditForm = {
      vendeurId: this.currentUser.id,
      lignes: [],
      modePaiement: ModePaiement.ESPECES,
      referencePaiement: '',
      estCredit: true,
      clientNom: '',
      clientPrenom: '',
      clientTelephone: '',
      dateEcheance: this.getDefaultEcheance(),
      montantVerse: 0
    };
    this.showNewVenteCreditModal = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.focusWhenAvailable('#clientSearchNomInput');
    }, 100);
  }

  openClientSelectorModal(): void {
    this.clientSearchForm = { nom: '', telephone: '' };
    this.clientsFiltres = [...this.clients];
    this.showClientSelectorModal = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.focusWhenAvailable('#clientSearchNomInput');
    }, 100);
  }

  openClientExportSelector(): void {
    this.clientsFiltres = [...this.clients];
    this.showClientExportSelector = true;
    this.cdr.detectChanges();
  }

  closeClientExportSelector(): void {
    this.showClientExportSelector = false;
    this.closeAllDropdowns();
  }

  async selectClientForExport(client: Client): Promise<void> {
    this.showClientExportSelector = false;
    await this.exportClientVentesWithStats(client);
    this.closeAllDropdowns();
  }

  openVenteDetailModal(vente: VenteMap): void {
    this.selectedVente = vente;
    this.showVenteDetailModal = true;
    this.cdr.detectChanges();

    this.venteService.getVenteById(vente.id).subscribe({
      next: (venteDetail: VenteMap) => {
        this.selectedVente = venteDetail;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Impossible de charger les détails de la vente';
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  openStatsModal(): void {
    this.loadStatistics();
    this.showStatsModal = true;
    this.cdr.detectChanges();
    this.closeAllDropdowns();
  }

  openCreditsModal(): void {
    this.loadCreditsData();
    this.showCreditsModal = true;
    this.cdr.detectChanges();
    this.closeAllDropdowns();
  }

  openStatsCreditsModal(): void {
    this.loadStatistiquesCredits();
    this.showStatsCreditsModal = true;
    this.cdr.detectChanges();
    this.closeAllDropdowns();
  }

  openSearchClientModal(): void {
    this.clientSearchForm = { nom: '', telephone: '' };
    this.situationCreditClient = null;
    this.showSearchClientModal = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.focusWhenAvailable('#clientSearchNom');
    }, 100);
    this.closeAllDropdowns();
  }

  openReglementCreditModal(vente: VenteMap): void {
    this.selectedCredit = vente;
    this.reglementForm = {
      venteId: vente.id,
      montantRegle: vente.montantRestant || vente.montantTotal,
      utilisateurId: this.currentUser?.id || 0,
      modePaiement: ModePaiement.ESPECES,
      referencePaiement: '',
      dateReglement: this.today
    };
    this.showReglementCreditModal = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.focusWhenAvailable('#montantReglement');
    }, 100);
  }

  openAnnulationModal(vente: VenteMap): void {
    if (vente.estCredit && vente.creditRegle) {
      this.errorMessage = 'Impossible d\'annuler un crédit déjà réglé';
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    this.selectedVente = vente;
    this.annulationForm = {
      motif: '',
      venteId: vente.id,
      venteNumero: vente.numeroVente
    };
    this.showAnnulationModal = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.focusWhenAvailable('#motifAnnulation');
    }, 100);
  }

  // ==================== CRÉATION DE VENTES ====================

  createVente(): void {
    if (!this.validateVenteForm(false)) return;

    const total = this.calculerTotalAvecRemiseGlobale();
    Swal.fire({
      title: 'Confirmer la vente',
      html: `Montant total : <b>${this.formatPrice(total)}</b><br>Voulez-vous enregistrer cette vente ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.prepareRemises(false);
      this.prepareClientInfo(false);

      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();

      this.venteService.createVente(this.venteForm).subscribe({
        next: (response: any) => {
          this.handleVenteSuccess(response, 'comptant');
        },
        error: (error: Error) => {
          this.handleVenteError(error);
        }
      });
    });
  }

  createVenteCredit(): void {
    if (!this.clientSelectionne) {
      this.errorMessage = 'Veuillez sélectionner un client';
      this.cdr.detectChanges();
      return;
    }

    this.creditForm.clientNom = this.clientSelectionne.nom;
    this.creditForm.clientPrenom = this.clientSelectionne.prenom || '';
    this.creditForm.clientTelephone = this.clientSelectionne.numeroTelephone;

    if (!this.validateVenteForm(true)) return;

    const total = this.calculerTotalAvecRemiseGlobale();
    const clientNom = `${this.clientSelectionne.nom} ${this.clientSelectionne.prenom || ''}`.trim();

    Swal.fire({
      title: 'Confirmer la vente à crédit',
      html: `Client : <b>${clientNom}</b><br>Montant : <b>${this.formatPrice(total)}</b><br>Confirmer cette vente à crédit ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.prepareRemises(true);

      this.creditForm.montantAvanceUtilise = this.utiliserAvance ? Math.min(this.montantAvanceAUtiliser, this.soldeAvanceClient) : 0;

      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();

      this.venteService.createVenteCredit(this.creditForm).subscribe({
        next: (response: any) => {
          this.handleVenteSuccess(response, 'crédit');
        },
        error: (error: Error) => {
          this.handleVenteError(error);
        }
      });
    });
  }

  // ==================== MISE À JOUR LOCALE DU STOCK ====================

  /**
   * Met à jour le stock localement après une vente sans faire d'appel API
   */
  private mettreAJourStockApresVente(vente: any): void {
    // Récupérer les lignes de la vente
    const lignes = vente.lignes || vente.produits || [];
    
    for (const ligne of lignes) {
      const produitId = ligne.produitId || ligne.produit?.id;
      const quantiteVendue = ligne.quantite;
      
      if (produitId && quantiteVendue) {
        // Mettre à jour dans produits (liste filtrée avec stock > 0)
        const produit = this.produits.find(p => p.id === produitId);
        if (produit) {
          const ancienStock = produit.quantite;
          produit.quantite = Math.max(0, produit.quantite - quantiteVendue);
          produit.stockFaible = produit.quantite <= produit.seuilAlerte;
          
          // Si le stock devient 0, on le retire de la liste des produits disponibles
          if (produit.quantite === 0) {
            const index = this.produits.findIndex(p => p.id === produitId);
            if (index !== -1) {
              this.produits.splice(index, 1);
            }
          }
          
          console.log(`✅ Stock mis à jour: ${produit.nom} -> ${ancienStock} → ${produit.quantite}`);
        }
        
        // Mettre à jour dans allProduits (tous les produits)
        const produitAll = this.allProduits.find(p => p.id === produitId);
        if (produitAll) {
          produitAll.quantite = Math.max(0, produitAll.quantite - quantiteVendue);
          produitAll.stockFaible = produitAll.quantite <= produitAll.seuilAlerte;
        }
      }
    }
    
    // Rafraîchir les revenus après mise à jour du stock
    this.calculerRevenus();
    this.cdr.detectChanges();
  }

  // ==================== PRÉPARATION DES DONNÉES ====================

  private prepareClientInfo(isCredit: boolean): void {
    if (isCredit) return;

    if (this.venteForm.clientDivers) {
      this.venteForm.clientId = undefined;
      this.venteForm.clientNom = 'Client divers';
      this.venteForm.clientPrenom = '';
      this.venteForm.clientTelephone = '';
    } else if (this.clientSelectionne) {
      this.venteForm.clientId = this.clientSelectionne.id;
      this.venteForm.clientNom = this.clientSelectionne.nom;
      this.venteForm.clientPrenom = this.clientSelectionne.prenom;
      this.venteForm.clientTelephone = this.clientSelectionne.numeroTelephone;
    }
  }

  // ==================== RÈGLEMENT DE CRÉDIT ====================

  reglementCredit(): void {
    if (!this.selectedCredit) {
      this.errorMessage = 'Aucun crédit sélectionné';
      this.cdr.detectChanges();
      return;
    }

    if (this.reglementForm.montantRegle <= 0) {
      this.errorMessage = 'Le montant du règlement doit être supérieur à 0';
      this.cdr.detectChanges();
      return;
    }

    if (this.reglementForm.montantRegle > (this.selectedCredit.montantRestant || this.selectedCredit.montantTotal)) {
      this.errorMessage = `Le montant ne peut pas dépasser ${this.formatPrice(this.selectedCredit.montantRestant || this.selectedCredit.montantTotal)}`;
      this.cdr.detectChanges();
      return;
    }

    if (this.reglementForm.modePaiement !== ModePaiement.ESPECES && !this.reglementForm.referencePaiement) {
      this.errorMessage = `Référence requise pour ${this.getModePaiementLabel(this.reglementForm.modePaiement)}`;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.venteService.enregistrerReglementCredit(this.reglementForm).subscribe({
      next: () => {
        this.successMessage = `Règlement de ${this.formatPrice(this.reglementForm.montantRegle)} enregistré avec succès!`;
        this.showReglementCreditModal = false;
        this.loadData();
        this.loadCreditsData();
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Erreur lors du règlement';
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ==================== RECHERCHE CLIENT ====================

  rechercherClient(): void {
    if (!this.clientSearchForm.nom && !this.clientSearchForm.telephone) {
      this.errorMessage = 'Veuillez saisir un nom ou un téléphone';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    if (this.clientSearchForm.nom) {
      this.venteService.getCreditsParClient(this.clientSearchForm.nom).subscribe({
        next: (credits: VenteMap[]) => {
          this.afficherSituationClient(credits);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          this.errorMessage = error.message || 'Client non trouvé';
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    } else if (this.clientSearchForm.telephone) {
      this.venteService.getAllCredits().subscribe({
        next: (credits: VenteMap[]) => {
          const creditsWithPhone = credits.filter(c => c.clientTelephone === this.clientSearchForm.telephone);
          this.afficherSituationClient(creditsWithPhone);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          this.errorMessage = error.message || 'Erreur lors de la recherche';
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    }
  }

  private afficherSituationClient(credits: VenteMap[]): void {
    if (credits.length > 0) {
      const creditsEnCours = credits.filter(c => !c.creditRegle);
      const creditsRegles = credits.filter(c => c.creditRegle);

      this.situationCreditClient = {
        clientNom: credits[0].clientNom || this.clientSearchForm.nom,
        clientTelephone: credits[0].clientTelephone,
        nombreTotalCredits: credits.length,
        nombreCreditsEnCours: creditsEnCours.length,
        nombreCreditsRegles: creditsRegles.length,
        montantTotalDu: creditsEnCours.reduce((sum, c) => sum + (c.montantRestant || c.montantTotal), 0),
        montantTotalRegle: creditsRegles.reduce((sum, c) => sum + (c.montantVerse || 0), 0),
        creditsEnCours: creditsEnCours,
        creditsRegles: creditsRegles
      };

      this.showSearchClientModal = false;
      this.showClientSituationModal = true;
      this.cdr.detectChanges();
    } else {
      this.errorMessage = 'Aucun crédit trouvé pour ce client';
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  // ==================== GESTION DU STOCK ET PANIER ====================

  getStockDisponible(produitId: number): number {
    const produitComplet = this.produits.find(p => p.id === produitId);
    return produitComplet ? produitComplet.quantite : 0;
  }

  addProduitToVente(produit: Produit): void {
    if (produit.quantite === 0) {
      this.errorMessage = `❌ Stock épuisé pour ${produit.nom}`;
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const existingIndex = this.produitsPanier.findIndex(p => p.id === produit.id);

    if (existingIndex >= 0) {
      const ligne = this.getActiveLignes()[existingIndex];
      if (!ligne) {
        this.errorMessage = `Impossible de modifier la ligne du produit ${produit.nom}`;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      const nouvelleQuantite = ligne.quantite + 1;

      const stockMaximum = this.showModifierVenteModal ? this.getMaxQuantite(existingIndex) : produit.quantite;
      if (nouvelleQuantite > stockMaximum) {
        this.errorMessage = `❌ Stock insuffisant pour ${produit.nom}. Stock disponible: ${stockMaximum}`;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      if (this.venteForm.lignes[existingIndex]) {
        this.venteForm.lignes[existingIndex].quantite = nouvelleQuantite;
      }
      if (this.creditForm.lignes[existingIndex]) {
        this.creditForm.lignes[existingIndex].quantite = nouvelleQuantite;
      }
      this.produitsPanier[existingIndex].quantite = nouvelleQuantite;
    } else {
      if (produit.quantite < 1) {
        this.errorMessage = `❌ Stock insuffisant pour ${produit.nom}`;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      this.venteForm.lignes.push({
        produitId: produit.id,
        quantite: 1,
        prixUnitaire: produit.prixVente
      });
      this.creditForm.lignes.push({
        produitId: produit.id,
        quantite: 1,
        prixUnitaire: produit.prixVente
      });
      this.produitsPanier.push({
        id: produit.id,
        nom: produit.nom,
        prixAchat: produit.prixAchat || 0,
        prixVente: produit.prixVente,
        prixModifie: produit.prixVente,
        quantite: 1,
        quantiteDisponible: produit.quantite,
        codeBarre: produit.codeBarre,
        modifierPrix: false,
        categorie: produit.categorie
      });
    }

    this.searchProduit = '';
    this.cdr.detectChanges();
  }

  removeProduitFromVente(index: number): void {
    this.venteForm.lignes.splice(index, 1);
    this.creditForm.lignes.splice(index, 1);
    this.produitsPanier.splice(index, 1);

    const newMap = new Map<number, { type: RemiseType, valeur: number }>();
    this.lignesAvecRemise.forEach((value, key) => {
      if (key < index) {
        newMap.set(key, value);
      } else if (key > index) {
        newMap.set(key - 1, value);
      }
    });
    this.lignesAvecRemise = newMap;
    this.cdr.detectChanges();
  }

  updateQuantite(index: number, quantite: number): void {
    const produitPanier = this.produitsPanier[index];
    if (!produitPanier) return;

    const produitComplet = this.produits.find(p => p.id === produitPanier.id);

    if (!produitComplet && !this.showModifierVenteModal) {
      this.errorMessage = `❌ Produit non trouvé: ${produitPanier?.nom}`;
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const maxQuantite = this.getMaxQuantite(index);

    if (quantite > maxQuantite) {
      this.errorMessage = `❌ Stock insuffisant pour ${produitPanier.nom}. Maximum disponible: ${maxQuantite}`;
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (quantite > 0 && quantite <= maxQuantite) {
      if (this.venteForm.lignes[index]) {
        this.venteForm.lignes[index].quantite = quantite;
      }
      if (this.creditForm.lignes[index]) {
        this.creditForm.lignes[index].quantite = quantite;
      }
      produitPanier.quantite = quantite;
      this.cdr.detectChanges();
    } else if (quantite <= 0) {
      this.errorMessage = `❌ La quantité doit être au moins 1 pour ${produitPanier.nom}`;
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  onQuantiteChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let quantite = parseInt(input.value, 10);

    if (isNaN(quantite)) quantite = 1;

    const produitPanier = this.produitsPanier[index];
    if (!produitPanier) return;

    const stockMax = this.getMaxQuantite(index);

    if (quantite > stockMax) {
      this.errorMessage = `❌ Stock insuffisant pour ${produitPanier.nom}. Maximum: ${stockMax}`;
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
      const currentValue = this.getActiveLignes()[index]?.quantite || produitPanier.quantite || 1;
      input.value = currentValue.toString();
      return;
    }

    if (quantite < 1) {
      this.errorMessage = `❌ La quantité doit être au moins 1 pour ${produitPanier.nom}`;
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
      input.value = "1";
      quantite = 1;
    }

    this.updateQuantite(index, quantite);
  }

  // ==================== GESTION PRIX UNITAIRE ====================

  toggleModifierPrix(index: number): void {
    this.produitsPanier[index].modifierPrix = !this.produitsPanier[index].modifierPrix;
    if (!this.produitsPanier[index].modifierPrix) {
      this.produitsPanier[index].prixModifie = this.produitsPanier[index].prixVente;
      this.updatePrixUnitaire(index, this.produitsPanier[index].prixVente);
    }
    this.cdr.detectChanges();
  }

  updatePrixUnitaire(index: number, nouveauPrix: any): void {
    let prix = parseFloat(nouveauPrix);
    if (isNaN(prix) || prix < 0) {
      return;
    }

    const produitPanier = this.produitsPanier[index];
    if (!produitPanier) return;

    produitPanier.prixModifie = prix;
    produitPanier.modifierPrix = prix !== produitPanier.prixVente;

    if (this.venteForm.lignes[index]) {
      this.venteForm.lignes[index].prixUnitaire = prix;
    }
    if (this.creditForm.lignes[index]) {
      this.creditForm.lignes[index].prixUnitaire = prix;
    }
    this.cdr.detectChanges();
  }

  onPrixChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let nouvelleValeur = parseFloat(input.value);
    if (isNaN(nouvelleValeur)) nouvelleValeur = 0;
    this.updatePrixUnitaire(index, nouvelleValeur);
  }

  getPrixUnitaireActuel(index: number): number {
    const produit = this.produitsPanier[index];
    if (!produit) return 0;
    const ligneActive = this.getActiveLignes()[index];
    if (ligneActive && ligneActive.prixUnitaire !== null && ligneActive.prixUnitaire !== undefined) {
      return Number(ligneActive.prixUnitaire) || 0;
    }
    return produit.prixModifie ?? produit.prixVente;
  }

  // ==================== VALIDATION ET PRÉPARATION ====================

  private validateVenteForm(isCredit: boolean): boolean {
    if (isCredit) {
      if (this.creditForm.vendeurId <= 0) {
        this.errorMessage = 'Utilisateur non identifié';
        this.cdr.detectChanges();
        return false;
      }

      if (this.creditForm.lignes.length === 0) {
        this.errorMessage = 'Ajoutez au moins un produit';
        this.cdr.detectChanges();
        return false;
      }

      if (!this.creditForm.modePaiement) {
        this.errorMessage = 'Sélectionnez un mode de paiement';
        this.cdr.detectChanges();
        return false;
      }

      if (this.creditForm.modePaiement !== ModePaiement.ESPECES && !this.creditForm.referencePaiement?.trim()) {
        this.errorMessage = `Référence requise pour ${this.getModePaiementLabel(this.creditForm.modePaiement)}`;
        this.cdr.detectChanges();
        return false;
      }

      if (!this.creditForm.clientNom || this.creditForm.clientNom.trim() === '') {
        this.errorMessage = 'Le nom du client est requis';
        this.cdr.detectChanges();
        return false;
      }

      if (!this.creditForm.dateEcheance) {
        this.errorMessage = 'La date d\'échéance est requise';
        this.cdr.detectChanges();
        return false;
      }

      const echeance = new Date(this.creditForm.dateEcheance);
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      if (!this.showModifierVenteModal && echeance < aujourdhui) {
        this.errorMessage = 'La date d\'échéance ne peut pas être dans le passé';
        this.cdr.detectChanges();
        return false;
      }

      const montantVerse = Number(this.creditForm.montantVerse || 0);
      const totalCredit = this.calculerTotalAvecRemiseGlobale();
      if (montantVerse < 0 || montantVerse > totalCredit) {
        this.errorMessage = 'Le montant versé ne peut pas dépasser le total du crédit';
        this.cdr.detectChanges();
        return false;
      }
    } else {
      if (this.venteForm.vendeurId <= 0) {
        this.errorMessage = 'Utilisateur non identifié';
        this.cdr.detectChanges();
        return false;
      }

      if (this.venteForm.lignes.length === 0) {
        this.errorMessage = 'Ajoutez au moins un produit';
        this.cdr.detectChanges();
        return false;
      }

      if (!this.venteForm.modePaiement) {
        this.errorMessage = 'Sélectionnez un mode de paiement';
        this.cdr.detectChanges();
        return false;
      }

      if (this.venteForm.modePaiement !== ModePaiement.ESPECES) {
        if (!this.venteForm.referencePaiement?.trim()) {
          this.errorMessage = `Référence requise pour ${this.getModePaiementLabel(this.venteForm.modePaiement)}`;
          this.cdr.detectChanges();
          return false;
        }
      }
    }

    const form = isCredit ? this.creditForm : this.venteForm;
    for (let i = 0; i < form.lignes.length; i++) {
      const ligne = form.lignes[i];
      const produitPanier = this.produitsPanier[i];
      const produitComplet = this.produits.find(p => p.id === produitPanier?.id);

      if (!produitComplet && !this.showModifierVenteModal) {
        this.errorMessage = `❌ Produit non trouvé: ${produitPanier?.nom}`;
        this.cdr.detectChanges();
        return false;
      }

      if (ligne.quantite <= 0) {
        this.errorMessage = `❌ Quantité invalide pour ${produitPanier?.nom}`;
        this.cdr.detectChanges();
        return false;
      }

      const maxQuantite = this.showModifierVenteModal ? this.getMaxQuantite(i) : (produitComplet?.quantite || 0);
      if (ligne.quantite > maxQuantite) {
        this.errorMessage = `❌ Stock insuffisant pour ${produitPanier?.nom}. Disponible: ${maxQuantite}`;
        this.cdr.detectChanges();
        return false;
      }
    }

    return true;
  }

  getMaxQuantite(index: number): number {
    const produitPanier = this.produitsPanier[index];
    if (!produitPanier) return 0;

    const produitComplet = this.produits.find(p => p.id === produitPanier.id);
    const stockDisponible = produitComplet?.quantite ?? produitPanier.quantiteDisponible ?? 0;

    if (this.showModifierVenteModal) {
      return Math.max(produitPanier.quantite, produitPanier.quantiteDisponible, stockDisponible);
    }

    return stockDisponible;
  }

  private synchroniserPanierAvecFormulaire(isCredit: boolean): void {
    const lignes: VenteRequest['lignes'] = this.produitsPanier.map((produit, index) => {
      const remise = this.lignesAvecRemise.get(index);
      const prixUnitaire = produit.modifierPrix ? produit.prixModifie : produit.prixVente;

      return {
        produitId: produit.id,
        quantite: Math.max(1, Number(produit.quantite) || 1),
        prixUnitaire: Number(prixUnitaire) || 0,
        remisePourcentage: remise?.type === RemiseType.POURCENTAGE ? remise.valeur : null,
        remiseMontant: remise?.type === RemiseType.MONTANT_FIXE ? remise.valeur : null
      };
    });

    if (isCredit) {
      this.creditForm.lignes = lignes;
    } else {
      this.venteForm.lignes = lignes;
    }
  }

  private prepareRemises(isCredit: boolean): void {
    const form = isCredit ? this.creditForm : this.venteForm;

    form.lignes.forEach((ligne, index) => {
      const remise = this.lignesAvecRemise.get(index);
      if (remise) {
        if (remise.type === RemiseType.POURCENTAGE) {
          ligne.remisePourcentage = remise.valeur;
          ligne.remiseMontant = null;
        } else {
          ligne.remiseMontant = remise.valeur;
          ligne.remisePourcentage = null;
        }
      } else {
        ligne.remisePourcentage = null;
        ligne.remiseMontant = null;
      }
    });

    if (this.showRemiseGlobale && this.remiseGlobale > 0) {
      form.remiseGlobale = this.remiseGlobale;
      form.typeRemiseGlobale = this.typeRemiseGlobale;
    } else {
      form.remiseGlobale = undefined;
      form.typeRemiseGlobale = undefined;
    }
  }

  private handleVenteSuccess(response: any, type: string): void {
    const vente = response.data || response;

    // ✅ Mettre à jour le stock localement sans appel API
    this.mettreAJourStockApresVente(vente);

    this.showNewVenteModal = false;
    this.showNewVenteCreditModal = false;
    this.showModifierVenteModal = false;
    this.resetForms();

    this.loadData();
    this.loadClients();

    this.isLoading = false;
    this.cdr.detectChanges();

    Swal.fire({
      icon: 'success',
      title: 'Vente enregistrée',
      text: `Vente ${vente.numeroVente} (${type}) enregistrée pour ${this.formatPrice(vente.montantTotal)}`,
      timer: 2500,
      timerProgressBar: true,
      confirmButtonColor: '#198754'
    });

    setTimeout(() => this.telechargerFacture(vente.id), 1000);
  }

  private handleVenteError(error: Error): void {
    this.isLoading = false;
    this.cdr.detectChanges();
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: error.message || 'Erreur lors de l\'opération',
      confirmButtonColor: '#d33'
    });
  }

  // ==================== GESTION DES REMISES ====================

  toggleRemiseLigne(index: number): void {
    if (this.lignesAvecRemise.has(index)) {
      this.lignesAvecRemise.delete(index);
    } else {
      this.lignesAvecRemise.set(index, { type: RemiseType.POURCENTAGE, valeur: 0 });
    }
    this.cdr.detectChanges();
  }

  updateRemiseLigne(index: number, type: RemiseType | string, valeur: any): void {
    let val = parseFloat(valeur);
    if (isNaN(val)) val = 0;
    if (val < 0) return;

    const typeEnum = typeof type === 'string' ? (type === 'POURCENTAGE' ? RemiseType.POURCENTAGE : RemiseType.MONTANT_FIXE) : type;

    if (typeEnum === RemiseType.POURCENTAGE && val > 100) {
      this.errorMessage = 'Remise maximale de 100%';
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const prixUnitaire = this.getPrixUnitaireActuel(index);
    if (typeEnum === RemiseType.MONTANT_FIXE && val > prixUnitaire) {
      this.errorMessage = `Remise maximale ${this.formatPrice(prixUnitaire)}`;
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.lignesAvecRemise.set(index, { type: typeEnum, valeur: val });
    this.cdr.detectChanges();
  }

  // ==================== CALCULS ====================

  private getActiveLignes(): VenteRequest['lignes'] {
    if (this.showNewVenteCreditModal || (this.showModifierVenteModal && this.isModificationCredit)) {
      return this.creditForm.lignes;
    }
    return this.venteForm.lignes;
  }

  getPrixApresRemise(index: number): number {
    const prixUnitaire = this.getPrixUnitaireActuel(index);
    const remise = this.lignesAvecRemise.get(index);
    if (!remise || remise.valeur === 0) return prixUnitaire;

    return this.venteService.calculerPrixApresRemise(
      prixUnitaire,
      remise.type === RemiseType.POURCENTAGE ? remise.valeur : undefined,
      remise.type === RemiseType.MONTANT_FIXE ? remise.valeur : undefined
    );
  }

  getMontantRemiseLigne(index: number): number {
    const prixUnitaire = this.getPrixUnitaireActuel(index);
    const ligne = this.getActiveLignes()[index];
    if (!ligne) return 0;

    return this.venteService.calculerMontantRemise(
      prixUnitaire,
      ligne.quantite,
      this.lignesAvecRemise.get(index)?.type === RemiseType.POURCENTAGE ? this.lignesAvecRemise.get(index)?.valeur : undefined,
      this.lignesAvecRemise.get(index)?.type === RemiseType.MONTANT_FIXE ? this.lignesAvecRemise.get(index)?.valeur : undefined
    );
  }

  calculerTotalSansRemiseGlobale(): number {
    let total = 0;
    const lignes = this.getActiveLignes();
    for (let i = 0; i < lignes.length; i++) {
      total += this.getPrixApresRemise(i) * lignes[i].quantite;
    }
    return total;
  }

  calculerTotalAvecRemiseGlobale(): number {
    const total = this.calculerTotalSansRemiseGlobale();
    if (!this.showRemiseGlobale || this.remiseGlobale <= 0) return total;

    if (this.typeRemiseGlobale === RemiseType.POURCENTAGE) {
      return Math.max(0, total - (total * this.remiseGlobale / 100));
    } else {
      return Math.max(0, total - this.remiseGlobale);
    }
  }

  calculerMontantRemiseGlobale(): number {
    return this.calculerTotalSansRemiseGlobale() - this.calculerTotalAvecRemiseGlobale();
  }

  // ==================== CALCUL DU BÉNÉFICE PAR PRODUIT ====================

  getBeneficeProduit(index: number): number {
    const produit = this.produitsPanier[index];
    if (!produit) return 0;
    const prixVente = this.getPrixApresRemise(index);
    const prixAchat = produit.prixAchat;
    const beneficeUnitaire = prixVente - prixAchat;
    return beneficeUnitaire * produit.quantite;
  }

  getBeneficeTotalPanier(): number {
    let total = 0;
    for (let i = 0; i < this.produitsPanier.length; i++) {
      total += this.getBeneficeProduit(i);
    }
    return total;
  }

  // ==================== UTILITAIRES ====================

  isProduitInPanier(produitId: number): boolean {
    return this.produitsPanier.some(p => p.id === produitId);
  }

  onCategorieChange(): void {
    this.searchProduit = '';
    this.cdr.detectChanges();
  }

  onSearchProduitChange(): void {
    this.cdr.detectChanges();
  }

  get filteredProduits(): Produit[] {
    let produitsFiltres = [...this.produits];
    
    if (this.selectedCategorieId !== null && this.selectedCategorieId !== undefined) {
      produitsFiltres = produitsFiltres.filter(p => p.categorie?.id === this.selectedCategorieId);
    }
    
    if (this.searchProduit && this.searchProduit.trim()) {
      const term = this.searchProduit.toLowerCase().trim();
      produitsFiltres = produitsFiltres.filter(p =>
        p.nom.toLowerCase().includes(term) ||
        (p.codeBarre && p.codeBarre.toLowerCase().includes(term))
      );
    }
    
    return produitsFiltres;
  }

  // ==================== FILTRES ET PAGINATION ====================

  get filteredVentes(): VenteMap[] {
    let filtered = [...this.ventes];

    if (!this.showAnnulees) {
      filtered = filtered.filter(v => !v.annulee);
    }
    if (!this.showRetournees) {
      filtered = filtered.filter(v => !v.estRetourne);
    }

    if (this.typeVenteFilter) {
      if (this.typeVenteFilter === 'COMPTANT') {
        filtered = filtered.filter(v => !v.estCredit);
      } else if (this.typeVenteFilter === 'CREDIT') {
        filtered = filtered.filter(v => v.estCredit);
      }
    }

    if (this.modePaiementFilter) {
      filtered = filtered.filter(v => v.modePaiement === this.modePaiementFilter);
    }

    if (this.dateDebut && this.dateFin) {
      filtered = filtered.filter(v => {
        const date = new Date(v.dateVente).toISOString().split('T')[0];
        return date >= this.dateDebut && date <= this.dateFin;
      });
    } else if (this.dateDebut) {
      filtered = filtered.filter(v => {
        const date = new Date(v.dateVente).toISOString().split('T')[0];
        return date >= this.dateDebut;
      });
    } else if (this.dateFin) {
      filtered = filtered.filter(v => {
        const date = new Date(v.dateVente).toISOString().split('T')[0];
        return date <= this.dateFin;
      });
    }

    if (this.heureDebut || this.heureFin) {
      filtered = filtered.filter(v => {
        const dt = new Date(v.dateVente);
        const hh = dt.getHours().toString().padStart(2, '0');
        const mm = dt.getMinutes().toString().padStart(2, '0');
        const time = `${hh}:${mm}`;
        if (this.heureDebut && this.heureFin) return time >= this.heureDebut && time <= this.heureFin;
        if (this.heureDebut) return time >= this.heureDebut;
        return time <= this.heureFin;
      });
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.numeroVente.toLowerCase().includes(term) ||
        v.vendeurNom.toLowerCase().includes(term) ||
        (v.clientNom && v.clientNom.toLowerCase().includes(term)) ||
        (v.clientTelephone && v.clientTelephone.toLowerCase().includes(term))
      );
    }

    return filtered;
  }

  get paginatedVentes(): VenteMap[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVentes.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVentes.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.searchClientTerm = '';
    this.modePaiementFilter = '';
    this.typeVenteFilter = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.heureDebut = '';
    this.heureFin = '';
    this.showTodayOnly = false;
    this.currentPage = 1;
    this.loadData();
    this.cdr.detectChanges();
  }

  filterToday(): void {
    const today = new Date().toISOString().split('T')[0];
    this.dateDebut = today;
    this.dateFin = today;
    this.showTodayOnly = false;
    this.applyFilters();
  }

  filterWeek(): void {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    this.dateDebut = monday.toISOString().split('T')[0];
    this.dateFin = today.toISOString().split('T')[0];
    this.showTodayOnly = false;
    this.applyFilters();
  }

  filterMonth(): void {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    this.dateDebut = first.toISOString().split('T')[0];
    this.dateFin = today.toISOString().split('T')[0];
    this.showTodayOnly = false;
    this.applyFilters();
  }

  resetForms(): void {
    this.venteForm = {
      vendeurId: this.currentUser?.id || 0,
      lignes: [],
      modePaiement: ModePaiement.ESPECES,
      referencePaiement: '',
      estCredit: false,
      clientDivers: true,
      clientId: undefined
    };
    this.creditForm = {
      vendeurId: this.currentUser?.id || 0,
      lignes: [],
      modePaiement: ModePaiement.ESPECES,
      referencePaiement: '',
      estCredit: true,
      clientNom: '',
      clientPrenom: '',
      clientTelephone: '',
      dateEcheance: this.getDefaultEcheance(),
      montantVerse: 0
    };
    this.reglementForm = {
      venteId: 0,
      montantRegle: 0,
      utilisateurId: this.currentUser?.id || 0,
      modePaiement: ModePaiement.ESPECES,
      referencePaiement: '',
      dateReglement: this.today
    };
    this.produitsPanier = [];
    this.lignesAvecRemise.clear();
    this.showRemiseGlobale = false;
    this.remiseGlobale = 0;
    this.typeRemiseGlobale = RemiseType.POURCENTAGE;
    this.searchProduit = '';
    this.selectedCategorieId = null;
    this.venteAModifier = null;
    this.isModificationCredit = false;
    this.clientSelectionne = null;
    this.showClientSearch = false;
    this.showNewClientForm = false;
    this.soldeAvanceClient = 0;
    this.utiliserAvance = false;
    this.montantAvanceAUtiliser = 0;
    this.cdr.detectChanges();
  }

  getDefaultEcheance(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }

  closeAllModals(): void {
    this.showNewVenteModal = false;
    this.showNewVenteCreditModal = false;
    this.showVenteDetailModal = false;
    this.showStatsModal = false;
    this.showModifierVenteModal = false;
    this.showCreditsModal = false;
    this.showReglementCreditModal = false;
    this.showStatsCreditsModal = false;
    this.showSearchClientModal = false;
    this.showClientSituationModal = false;
    this.showAnnulationModal = false;
    this.showClientSelectorModal = false;
    this.showHistoriqueReglementsModal = false;
    this.showModificationLignesModal = false;
    this.showClientExportSelector = false;
    this.showFactureDateModal = false;
    this.venteForFacture = null;
    this.selectedVente = null;
    this.selectedCredit = null;
    this.venteAModifier = null;
    this.situationCreditClient = null;
    this.annulationForm = { motif: '', venteId: 0, venteNumero: '' };
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForms();
    this.cdr.detectChanges();
  }

  // ==================== GETTERS POUR LES CARTES ====================

  getMontantTotal(): number {
    return this.filteredVentes.reduce((sum, v) => sum + v.montantTotal, 0);
  }

  getMontantComptant(): number {
    return this.filteredVentes
      .filter(v => !v.estCredit)
      .reduce((sum, v) => sum + v.montantTotal, 0);
  }

  getMontantDuTotal(): number {
    return this.filteredVentes
      .filter(v => v.estCredit && !v.creditRegle)
      .reduce((sum, v) => sum + (v.montantRestant || v.montantTotal), 0);
  }

  getCreditsEnCoursCount(): number {
    return this.filteredVentes.filter(v => v.estCredit && !v.creditRegle).length;
  }

  // ==================== DÉLÉGATION AU SERVICE ====================

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isVendeur(): boolean {
    return this.authService.isVendeur();
  }

  get canManageVentes(): boolean {
    return this.isAdmin || this.isVendeur;
  }

  getVendeurDisplay(vente: VenteMap): string {
    return vente.vendeurNom || 'N/A';
  }

  getVendeurRole(vente: VenteMap): string {
    const role = (vente as any).vendeurRole || (vente.vendeurId === this.currentUser?.id ? this.currentUser?.role : '');
    return role ? this.venteService.getRoleLabel(role) : 'Vendeur';
  }

  getRoleLabel(role: string): string {
    return this.venteService.getRoleLabel(role);
  }

  getVendeurTelephone(vente: VenteMap): string {
    return (vente as any).vendeurTelephone || (vente.vendeurId === this.currentUser?.id ? this.currentUser?.telephone : '') || '';
  }

  getVendeurEmail(vente: VenteMap): string {
    return (vente as any).vendeurEmail || (vente.vendeurId === this.currentUser?.id ? this.currentUser?.email : '') || '';
  }

  getModePaiementOptions(): ModePaiement[] {
    return this.venteService.getModePaiementOptions();
  }

  getModePaiementLabel(mode: string | ModePaiement): string {
    return this.venteService.getModePaiementLabel(mode);
  }

  getModePaiementClass(mode: string | ModePaiement): string {
    return this.venteService.getModePaiementClass(mode);
  }

  getModePaiementPlaceholder(): string {
    const mode = this.isModificationCredit ? this.creditForm.modePaiement : this.venteForm.modePaiement;
    switch (mode) {
      case ModePaiement.ORANGE_MONEY:
      case ModePaiement.MOOV_MONEY:
        return 'Numero de transaction';
      case ModePaiement.CARTE_BANCAIRE:
        return 'Reference carte bancaire';
      case ModePaiement.VIREMENT:
        return 'Reference virement';
      default:
        return 'Reference paiement';
    }
  }

  formatPrice(price: number): string {
    return this.venteService.formatPrice(price);
  }

  formatPriceShort(price: number): string {
    return this.venteService.formatPriceShort(price);
  }

  formatDate(dateString: string): string {
    return this.venteService.formatDate(dateString);
  }

  formatDateShort(dateString: string): string {
    return this.venteService.formatDateShort(dateString);
  }

  isCreditEnRetard(vente: VenteMap): boolean {
    if (!vente.estCredit || !vente.dateEcheance || vente.creditRegle) return false;
    const echeance = new Date(vente.dateEcheance);
    const aujourdhui = new Date();
    return echeance < aujourdhui;
  }

  getCreditStatusClass(vente: VenteMap): string {
    return this.venteService.getCreditStatusClass(vente);
  }

  getCreditStatusText(vente: VenteMap): string {
    return this.venteService.getCreditStatusText(vente);
  }

  telechargerFacture(venteId: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.venteService.telechargerFacture(venteId).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Facture générée';
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  openFactureDateModal(venteId: number): void {
    this.venteService.getVenteById(venteId).subscribe({
      next: (vente) => {
        this.venteForFacture = vente;
        this.factureDateCustom = vente.dateVente ? vente.dateVente.split('T')[0] : this.today;
        this.showFactureDateModal = true;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  confirmerGenerationFacture(): void {
    if (!this.venteForFacture) return;
    const venteAvecDate = { ...this.venteForFacture, dateVente: this.factureDateCustom };
    this.venteService.imprimerFacture(venteAvecDate);
    this.showFactureDateModal = false;
    this.venteForFacture = null;
  }

  exportToExcel(): void {
    this.successMessage = 'Fonctionnalité d\'export en développement';
    this.cdr.detectChanges();
    setTimeout(() => this.successMessage = '', 3000);
  }

  getProduitsList(vente: VenteMap): string {
    if (!vente.produits || vente.produits.length === 0) return '-';
    return vente.produits.map((p: any) =>
      `${p.quantite}x ${p.produitNom || 'Produit'}`
    ).join(', ');
  }

  getProduitsCount(vente: VenteMap): number {
    if (!vente.produits) return 0;
    return vente.produits.length;
  }

  getVenteTypeBadgeClass(vente: VenteMap): string {
    if (!vente.estCredit) return 'bg-success';
    if (vente.creditRegle) return 'bg-info';
    if (this.isCreditEnRetard(vente)) return 'bg-danger';
    return 'bg-warning text-dark';
  }

  getVenteTypeLabel(vente: VenteMap): string {
    if (!vente.estCredit) return 'COMPTANT';
    if (vente.creditRegle) return 'CRÉDIT RÉGLÉ';
    if (this.isCreditEnRetard(vente)) return 'CRÉDIT RETARD';
    return 'CRÉDIT';
  }

  getVenteTypeIcon(vente: VenteMap): string {
    if (!vente.estCredit) return 'fa-money';
    if (vente.creditRegle) return 'fa-check-circle';
    if (this.isCreditEnRetard(vente)) return 'fa-exclamation-triangle';
    return 'fa-credit-card';
  }

  getVenteStatusBadgeClass(vente: VenteMap): string {
    if (vente.annulee) return 'bg-secondary';
    if (vente.estRetourne) return 'bg-dark';
    if (!vente.estCredit) return 'bg-success';
    if (vente.creditRegle) return 'bg-info';
    if (this.isCreditEnRetard(vente)) return 'bg-danger';
    return 'bg-warning text-dark';
  }

  getVenteStatusLabel(vente: VenteMap): string {
    if (vente.annulee) return 'Annulée';
    if (vente.estRetourne) return 'Retourné';
    if (!vente.estCredit) return 'Payé';
    if (vente.creditRegle) return 'Réglé';
    if (this.isCreditEnRetard(vente)) return 'En retard';
    return 'En cours';
  }

  // ==================== EXPORTS PDF ====================

  private loadProduitsForExport(): Promise<any[]> {
    return new Promise((resolve) => {
      this.productService.getProducts().subscribe({
        next: (produits) => {
          resolve(produits || []);
        },
        error: () => {
          resolve([]);
        }
      });
    });
  }

  async exportAllVentesWithStats(): Promise<void> {
    if (this.filteredVentes.length === 0) {
      this.errorMessage = 'Aucune vente à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportVentesDetailToPDF(
        this.filteredVentes,
        'RAPPORT_COMPLET_DES_VENTES',
        produits
      );
      this.successMessage = 'Export PDF avec statistiques lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  async exportTodayVentesWithStats(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const todayVentes = this.filteredVentes.filter(v => v.dateVente?.startsWith(today));

    if (todayVentes.length === 0) {
      this.errorMessage = 'Aucune vente aujourd\'hui à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportVentesDuJourToPDF(todayVentes, produits);
      this.successMessage = 'Export PDF des ventes du jour lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  async exportWeekVentesWithStats(): Promise<void> {
    const aujourdhui = new Date();
    const debutSemaine = new Date(aujourdhui);
    debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay());
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6);

    const semaineVentes = this.filteredVentes.filter(v => {
      const dateVente = new Date(v.dateVente);
      return dateVente >= debutSemaine && dateVente <= finSemaine;
    });

    if (semaineVentes.length === 0) {
      this.errorMessage = 'Aucune vente cette semaine à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportVentesSemaineToPDF(semaineVentes, produits);
      this.successMessage = 'Export PDF des ventes de la semaine lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  async exportMonthVentesWithStats(): Promise<void> {
    const aujourdhui = new Date();
    const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
    const finMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0);

    const moisVentes = this.filteredVentes.filter(v => {
      const dateVente = new Date(v.dateVente);
      return dateVente >= debutMois && dateVente <= finMois;
    });

    if (moisVentes.length === 0) {
      this.errorMessage = 'Aucune vente ce mois à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportVentesMoisToPDF(moisVentes, produits);
      this.successMessage = 'Export PDF des ventes du mois lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  async exportCustomPeriodVentesWithStats(): Promise<void> {
    if (!this.dateDebut && !this.dateFin) {
      this.errorMessage = 'Veuillez sélectionner une période';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    let periodeVentes = [...this.filteredVentes];
    let periodeLabel = '';

    if (this.dateDebut && this.dateFin) {
      periodeLabel = `du ${this.dateDebut} au ${this.dateFin}`;
    } else if (this.dateDebut) {
      periodeLabel = `depuis le ${this.dateDebut}`;
    } else if (this.dateFin) {
      periodeLabel = `jusqu'au ${this.dateFin}`;
    }

    if (periodeVentes.length === 0) {
      this.errorMessage = `Aucune vente trouvée ${periodeLabel}`;
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportVentesParPeriodeToPDF(
        periodeVentes,
        produits,
        this.dateDebut || this.formatDateForFileName(new Date().toISOString()),
        this.dateFin || this.formatDateForFileName(new Date().toISOString()),
        `RAPPORT_VENTES_${periodeLabel.replace(/ /g, '_')}`
      );
      this.successMessage = `Export PDF pour ${periodeLabel} lancé`;
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  async exportClientVentesWithStats(client: Client): Promise<void> {
    const clientVentes = this.filteredVentes.filter(v =>
      v.clientId === client.id ||
      v.clientNom?.toLowerCase() === client.nom.toLowerCase()
    );

    if (clientVentes.length === 0) {
      this.errorMessage = `Aucune vente trouvée pour ${client.nom} ${client.prenom}`;
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportVentesParClientToPDF(
        clientVentes,
        produits,
        client.nom,
        client.prenom,
        client.numeroTelephone
      );
      this.successMessage = `Export PDF des ventes pour ${client.nom} ${client.prenom} lancé`;
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  async exportClientDiversVentesWithStats(): Promise<void> {
    const clientDiversVentes = this.filteredVentes.filter(v => v.clientDivers === true);

    if (clientDiversVentes.length === 0) {
      this.errorMessage = 'Aucune vente client divers à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportVentesClientDiversToPDF(clientDiversVentes, produits);
      this.successMessage = 'Export PDF des ventes client divers lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  async exportOnlyCreditVentesWithStats(): Promise<void> {
    const creditVentes = this.filteredVentes.filter(v => v.estCredit === true);

    if (creditVentes.length === 0) {
      this.errorMessage = 'Aucune vente crédit à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportVentesCreditToPDF(creditVentes, produits);
      this.successMessage = 'Export PDF des ventes crédit lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  async exportCreditsRetardWithStats(): Promise<void> {
    const creditsRetard = this.filteredVentes.filter(v =>
      v.estCredit === true && !v.creditRegle && this.isCreditEnRetard(v)
    );

    if (creditsRetard.length === 0) {
      this.errorMessage = 'Aucun crédit en retard à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    try {
      this.isLoading = true;
      const produits = await this.loadProduitsForExport();
      this.venteService.exportCreditsEnRetardToPDF(creditsRetard, produits);
      this.successMessage = 'Export PDF des crédits en retard lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.isLoading = false;
      this.closeAllDropdowns();
    }
  }

  exportAllVentesDetailToPDF(): void {
    if (this.filteredVentes.length === 0) {
      this.errorMessage = 'Aucune vente à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportVentesDetailleesToPDF(this.filteredVentes, 'RAPPORT_COMPLET_VENTES');
      this.successMessage = 'Export PDF détaillé lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.closeAllDropdowns();
    }
  }

  exportCreditDetailToPDF(): void {
    const credit = this.filteredVentes.filter(v => v.estCredit);
    if (credit.length === 0) {
      this.errorMessage = 'Aucune vente crédit à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportVentesCreditDetailToPDF(credit);
      this.successMessage = 'Export PDF crédit détaillé lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.closeAllDropdowns();
    }
  }

  exportCreditsRetardDetailToPDF(): void {
    const creditsRetard = this.filteredVentes.filter(v => v.estCredit && !v.creditRegle && this.isCreditEnRetard(v));
    if (creditsRetard.length === 0) {
      this.errorMessage = 'Aucun crédit en retard à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportCreditsRetardDetailToPDF(creditsRetard);
      this.successMessage = 'Export PDF crédits retard détaillé lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.closeAllDropdowns();
    }
  }

  exportAllVentesSimplePDF(): void {
    if (this.filteredVentes.length === 0) {
      this.errorMessage = 'Aucune vente à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportVentesToPDF(this.filteredVentes, 'LISTE_DES_VENTES');
      this.successMessage = 'Export PDF simple lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.closeAllDropdowns();
    }
  }

  formatDateForFileName(dateString: string): string {
    return this.venteService.formatDateForFileName(dateString);
  }

  validatePrixVenteProduit(produit: Produit, prixVenteSaisi?: number): boolean {
    const prixVente = prixVenteSaisi || produit.prixVente;
    if (prixVente < produit.prixAchat) {
      this.errorMessage = `⚠️ Prix de vente (${this.formatPrice(prixVente)}) inférieur au prix d'achat (${this.formatPrice(produit.prixAchat)}). Vente impossible !`;
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 5000);
      return false;
    }
    return true;
  }

  getBeneficeProduitColor(index: number): string {
    const benefice = this.getBeneficeProduit(index);
    if (benefice > 0) return 'text-success';
    if (benefice < 0) return 'text-danger';
    return 'text-muted';
  }

  getBeneficeProduitLabel(index: number): string {
    const benefice = this.getBeneficeProduit(index);
    if (benefice > 0) return 'Bénéfice';
    if (benefice < 0) return 'Perte';
    return 'Équilibre';
  }

  Math = Math;

  // ==================== ANNULATION DE VENTE ====================

  annulerVente(): void {
    if (!this.selectedVente) {
      this.errorMessage = 'Aucune vente sélectionnée';
      this.cdr.detectChanges();
      return;
    }

    if (!this.annulationForm.motif || this.annulationForm.motif.trim() === '') {
      this.errorMessage = 'Veuillez fournir un motif d\'annulation';
      this.cdr.detectChanges();
      return;
    }

    const numVente = this.selectedVente.numeroVente;
    Swal.fire({
      title: 'Annuler cette vente ?',
      html: `Vente <strong>${numVente}</strong> sera annulée.<br>Les produits retourneront en stock.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();
      const annulationRequest = this.selectedVente!.estCredit
        ? this.venteService.annulerVenteCredit(this.selectedVente!.id, this.annulationForm.motif)
        : this.venteService.annulerVente(this.selectedVente!.id, this.annulationForm.motif);
      annulationRequest.subscribe({
        next: () => {
          this.showAnnulationModal = false;
          this.selectedVente = null;
          this.annulationForm = { motif: '', venteId: 0, venteNumero: '' };
          this.loadData();
          this.loadCreditsData();
          this.loadProduits();
          this.isLoading = false;
          this.cdr.detectChanges();
          Swal.fire({ icon: 'success', title: 'Annulée', text: `Vente ${numVente} annulée avec succès.`, timer: 2500, timerProgressBar: true, confirmButtonColor: '#198754' });
        },
        error: (error: Error) => {
          this.errorMessage = error.message || 'Erreur lors de l\'annulation';
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    });
  }

  // ==================== MODIFICATION LIGNES DE VENTE ====================

  ouvrirModificationLignes(vente: VenteMap): void {
    this.venteAModifier = vente;
    this.modificationMotif = '';
    this.modificationLignes = (vente.lignes || []).map(l => ({
      produitId: l.produitId,
      produitNom: l.produitNom,
      prixUnitaire: l.prixUnitaire,
      quantite: l.quantite,
      ancienProduitId: l.produitId
    }));
    this.showModificationLignesModal = true;
    this.cdr.detectChanges();
  }

  get ancienTotalModification(): number {
    return this.venteAModifier?.montantTotal || 0;
  }

  get nouveauTotalModification(): number {
    return this.modificationLignes.reduce((sum, l) => sum + l.prixUnitaire * l.quantite, 0);
  }

  get differenceModification(): number {
    return this.nouveauTotalModification - this.ancienTotalModification;
  }

  changerProduitLigne(index: number, produitId: number): void {
    const produit = this.produits.find(p => p.id === +produitId);
    if (produit) {
      this.modificationLignes[index].produitId = produit.id;
      this.modificationLignes[index].produitNom = produit.nom;
      this.modificationLignes[index].prixUnitaire = produit.prixVente || produit.prixAchat || 0;
    }
  }

  supprimerLigneModification(index: number): void {
    if (this.modificationLignes.length <= 1) {
      Swal.fire({ icon: 'warning', title: 'Impossible', text: 'La vente doit avoir au moins une ligne.', confirmButtonColor: '#3085d6' });
      return;
    }
    this.modificationLignes.splice(index, 1);
    this.cdr.detectChanges();
  }

  ajouterLigneModification(): void {
    this.modificationLignes.push({ produitId: 0, produitNom: '', prixUnitaire: 0, quantite: 1 });
    this.cdr.detectChanges();
  }

  confirmerModificationLignes(): void {
    if (!this.venteAModifier) return;

    const lignesInvalides = this.modificationLignes.filter(l => !l.produitId || l.produitId === 0 || l.quantite <= 0);
    if (lignesInvalides.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Lignes incomplètes', text: 'Veuillez sélectionner un produit et une quantité valide pour chaque ligne.', confirmButtonColor: '#3085d6' });
      return;
    }

    const diff = this.differenceModification;
    const diffLabel = diff === 0
      ? 'Pas de différence de prix.'
      : diff > 0
        ? `Le client doit payer <strong>${this.formatPrice(diff)}</strong> supplémentaires → entrée en caisse.`
        : `Remboursement de <strong>${this.formatPrice(Math.abs(diff))}</strong> au client → sortie de caisse.`;

    Swal.fire({
      title: 'Confirmer la modification ?',
      html: `
        <div class="text-left">
          <p><strong>Vente :</strong> ${this.venteAModifier.numeroVente}</p>
          <p><strong>Ancien total :</strong> ${this.formatPrice(this.ancienTotalModification)}</p>
          <p><strong>Nouveau total :</strong> ${this.formatPrice(this.nouveauTotalModification)}</p>
          <p class="${diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-muted'} font-weight-bold">${diffLabel}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isModificationLoading = true;
      this.cdr.detectChanges();

      const lignesRequest: LigneVenteRequest[] = this.modificationLignes.map(l => ({
        produitId: l.produitId,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire
      }));

      this.venteService.modifierLignesVente(this.venteAModifier!.id, lignesRequest, this.modificationMotif).subscribe({
        next: (res) => {
          this.showModificationLignesModal = false;
          this.isModificationLoading = false;
          this.loadData();
          this.loadCreditsData();
          this.loadProduits();
          this.cdr.detectChanges();

          const msgDiff = res.difference > 0
            ? `+${this.formatPrice(res.difference)} encaissés`
            : res.difference < 0
              ? `${this.formatPrice(res.difference)} remboursés`
              : 'Aucun ajustement de caisse';

          Swal.fire({
            icon: 'success',
            title: 'Vente modifiée !',
            html: `Vente <strong>${res.numeroVente}</strong> mise à jour.<br><small>${msgDiff}</small>`,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        },
        error: (error: Error) => {
          this.isModificationLoading = false;
          this.cdr.detectChanges();
          Swal.fire({ icon: 'error', title: 'Erreur', text: error.message || 'Erreur lors de la modification.', confirmButtonColor: '#d33' });
        }
      });
    });
  }

  supprimerVente(vente: VenteMap): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Seul un administrateur peut supprimer définitivement une vente';
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    Swal.fire({
      title: 'Suppression définitive',
      html: `Vente <strong>${vente.numeroVente}</strong> sera supprimée définitivement.<br>Cette action est irréversible.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Supprimer définitivement',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();
      const suppressionRequest = vente.estCredit
        ? this.venteService.supprimerVenteCredit(vente.id)
        : this.venteService.supprimerVente(vente.id);
      suppressionRequest.subscribe({
        next: () => {
          this.loadData();
          this.loadCreditsData();
          this.isLoading = false;
          this.cdr.detectChanges();
          Swal.fire({ icon: 'success', title: 'Supprimée', text: `Vente ${vente.numeroVente} supprimée.`, timer: 2000, timerProgressBar: true, confirmButtonColor: '#198754' });
        },
        error: (error: Error) => {
          this.errorMessage = error.message || 'Erreur lors de la suppression';
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    });
  }

  // ==================== MODIFICATION DE VENTES ====================

  openModifierVenteModal(vente: VenteMap): void {
    if (!this.currentUser) {
      this.currentUser = { id: vente.vendeurId || 1 } as User;
    }

    if (!this.peutModifierVente(vente)) {
      this.errorMessage = vente.annulee
        ? 'Cette vente est deja annulee.'
        : 'Ce credit est deja regle et ne peut plus etre modifie.';
      this.cdr.detectChanges();
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    if (!this.currentUser || this.currentUser.id <= 0) {
      this.errorMessage = 'Impossible d\'identifier l\'utilisateur.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const venteObservable = vente.estCredit
      ? this.venteService.getVenteCreditById(vente.id)
      : this.venteService.getVenteById(vente.id);

    venteObservable.subscribe({
      next: (venteDetaillee: VenteMap) => {
        this.prepareModifierVenteModal(venteDetaillee);
        this.showModifierVenteModal = true;
        this.isLoading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.focusWhenAvailable('#searchProduitModifInput');
        }, 100);
      },
      error: (error: Error) => {
        this.errorMessage = `${error.message}. Impossible de charger les détails.`;
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  private prepareModifierVenteModal(venteDetail: VenteMap): void {
    this.venteAModifier = venteDetail;

    if (venteDetail.estCredit) {
      this.isModificationCredit = true;
      this.creditForm = {
        vendeurId: this.currentUser?.id || 0,
        lignes: [],
        modePaiement: venteDetail.modePaiement as ModePaiement,
        referencePaiement: venteDetail.referencePaiement || '',
        estCredit: true,
        clientNom: venteDetail.clientNom || '',
        clientPrenom: venteDetail.clientPrenom || '',
        clientTelephone: venteDetail.clientTelephone || '',
        dateEcheance: venteDetail.dateEcheance || this.getDefaultEcheance(),
        montantVerse: venteDetail.montantVerse || 0
      };

      if (venteDetail.clientId && !venteDetail.clientDivers) {
        const client = this.clients.find(c => c.id === venteDetail.clientId);
        if (client) this.clientSelectionne = client;
      }

      this.loadProduitsPourModification(venteDetail, true);
    } else {
      this.isModificationCredit = false;
      this.venteForm = {
        vendeurId: this.currentUser?.id || 0,
        lignes: [],
        modePaiement: venteDetail.modePaiement as ModePaiement,
        referencePaiement: venteDetail.referencePaiement || '',
        estCredit: false,
        clientDivers: venteDetail.clientDivers ?? true,
        clientId: venteDetail.clientId,
        clientNom: venteDetail.clientNom || '',
        clientPrenom: venteDetail.clientPrenom || '',
        clientTelephone: venteDetail.clientTelephone || ''
      };

      if (venteDetail.clientId && !venteDetail.clientDivers) {
        const client = this.clients.find(c => c.id === venteDetail.clientId);
        if (client) {
          this.clientSelectionne = client;
          this.venteForm.clientDivers = false;
        }
      }

      this.loadProduitsPourModification(venteDetail, false);
    }
  }

  loadProduitsPourModification(vente: VenteMap, isCredit: boolean): void {
    console.log('=== DÉBUT CHARGEMENT PRODUITS POUR MODIFICATION ===');
    console.log('Vente reçue:', vente);
    console.log('Vente.estCredit:', vente.estCredit);
    console.log('Vente.produits:', vente.produits);

    this.produitsPanier = [];
    const form = isCredit ? this.creditForm : this.venteForm;
    form.lignes = [];
    this.lignesAvecRemise.clear();

    const produitsSource = vente.produits || [];

    console.log('Source des produits à charger:', produitsSource);
    console.log('Nombre de produits trouvés:', produitsSource.length);

    if (produitsSource && produitsSource.length > 0) {
      produitsSource.forEach((produit: any, idx: number) => {
        console.log(`--- Produit ${idx} ---`);
        console.log('Produit brut:', produit);

        const produitId = produit.produitId || produit.id;
        console.log('Produit ID:', produitId);

        const produitComplet = this.produits.find(p => p.id === produitId);
        console.log('Produit complet trouvé:', produitComplet?.nom);

        let prixUnitaire = produit.prixUnitaire || produit.prixVente || 0;
        if (prixUnitaire === 0 && produitComplet) {
          prixUnitaire = produitComplet.prixVente;
        }
        console.log('Prix unitaire:', prixUnitaire);

        const prixCatalogue = produitComplet?.prixVente || prixUnitaire;

        const quantiteVendue = produit.quantite || 1;
        console.log('Quantité vendue:', quantiteVendue);

        let quantiteDisponible = 999;
        if (produitComplet) {
          quantiteDisponible = produitComplet.quantite + quantiteVendue;
        }
        console.log('Quantité disponible (stock+retour):', quantiteDisponible);

        const produitNom = produit.produitNom || produit.nom || produitComplet?.nom || 'Produit';
        console.log('Nom produit:', produitNom);

        const remisePourcentage = produit.remisePourcentage || null;
        const remiseMontant = produit.remiseMontant || null;
        console.log('Remise %:', remisePourcentage);
        console.log('Remise montant:', remiseMontant);

        form.lignes.push({
          produitId: produitId,
          quantite: quantiteVendue,
          prixUnitaire: prixUnitaire,
          remisePourcentage: remisePourcentage,
          remiseMontant: remiseMontant
        });

        const nouveauProduitPanier = {
          id: produitId,
          nom: produitNom,
          prixAchat: produitComplet?.prixAchat || 0,
          prixVente: prixCatalogue,
          prixModifie: prixUnitaire,
          quantite: quantiteVendue,
          quantiteDisponible: quantiteDisponible,
          codeBarre: produitComplet?.codeBarre || '',
          modifierPrix: prixUnitaire !== prixCatalogue,
          categorie: produitComplet?.categorie
        };

        this.produitsPanier.push(nouveauProduitPanier);
        console.log('Produit ajouté au panier:', nouveauProduitPanier);

        if (remisePourcentage && remisePourcentage > 0) {
          this.lignesAvecRemise.set(this.produitsPanier.length - 1, {
            type: RemiseType.POURCENTAGE,
            valeur: remisePourcentage
          });
          console.log('Remise % enregistrée pour index:', this.produitsPanier.length - 1);
        } else if (remiseMontant && remiseMontant > 0) {
          this.lignesAvecRemise.set(this.produitsPanier.length - 1, {
            type: RemiseType.MONTANT_FIXE,
            valeur: remiseMontant
          });
          console.log('Remise montant enregistrée pour index:', this.produitsPanier.length - 1);
        }
      });
    } else {
      console.warn('⚠️ Aucun produit trouvé dans la vente. Vérifiez la structure du backend.');
      console.warn('Structure complète de la vente:', JSON.stringify(vente, null, 2));
    }

    if (vente.remiseGlobale && vente.remiseGlobale > 0) {
      this.showRemiseGlobale = true;
      this.remiseGlobale = vente.remiseGlobale;
      this.typeRemiseGlobale = (vente.typeRemiseGlobale as RemiseType) || RemiseType.POURCENTAGE;
      console.log('Remise globale chargée:', this.remiseGlobale, this.typeRemiseGlobale);
    } else {
      this.showRemiseGlobale = false;
      this.remiseGlobale = 0;
    }

    console.log('=== FIN CHARGEMENT ===');
    console.log('Panier final:', this.produitsPanier);
    console.log('Nombre de produits dans le panier:', this.produitsPanier.length);
    console.log('Lignes formulaire:', form.lignes);

    this.cdr.detectChanges();
  }

  private modifierVenteComptant(): void {
    this.synchroniserPanierAvecFormulaire(false);
    if (!this.validateVenteForm(false)) return;

    this.prepareRemises(false);
    this.prepareClientInfo(false);

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.venteService.modifierVente(this.venteAModifier!.id, this.venteForm).subscribe({
      next: (response: any) => {
        const vente = response.data || response;
        this.successMessage = `Vente ${vente.numeroVente} modifiée avec succès!`;
        this.showModifierVenteModal = false;
        this.venteAModifier = null;
        this.resetForms();
        this.loadData();
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Erreur lors de la modification';
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  private modifierVenteCredit(): void {
    if (this.clientSelectionne) {
      this.creditForm.clientNom = this.clientSelectionne.nom;
      this.creditForm.clientPrenom = this.clientSelectionne.prenom || '';
      this.creditForm.clientTelephone = this.clientSelectionne.numeroTelephone;
    }

    this.synchroniserPanierAvecFormulaire(true);
    if (!this.validateVenteForm(true)) return;

    this.prepareRemises(true);

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.venteService.modifierVenteCredit(this.venteAModifier!.id, this.creditForm).subscribe({
      next: (response: any) => {
        const vente = response.data || response;
        this.successMessage = `Crédit ${vente.numeroVente} modifié avec succès!`;
        this.showModifierVenteModal = false;
        this.venteAModifier = null;
        this.resetForms();
        this.loadData();
        this.loadCreditsData();
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Erreur lors de la modification du crédit';
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  modifierVente(): void {
    if (!this.venteAModifier) {
      this.errorMessage = 'Aucune vente sélectionnée';
      this.cdr.detectChanges();
      return;
    }

    if (this.isModificationCredit) {
      this.modifierVenteCredit();
    } else {
      this.modifierVenteComptant();
    }
  }

  peutModifierVente(vente: VenteMap): boolean {
    if (vente.annulee) return false;
    if (vente.estCredit && vente.creditRegle) return false;
    return true;
  }

  peutAnnulerVente(vente: VenteMap): boolean {
    if (vente.annulee) return false;
    if (vente.estCredit && vente.creditRegle) return false;
    return true;
  }

  peutSupprimerVente(vente: VenteMap): boolean {
    return this.isAdmin && vente.annulee === true;
  }

  // ==================== RETOUR VENTE ====================

  get totalRetourVente(): number {
    return this.retourVenteLignes
      .filter(l => l.selected && l.quantiteRetournee > 0)
      .reduce((sum, l) => sum + l.quantiteRetournee * l.prixUnitaire, 0);
  }

  openRetourVenteModal(vente: VenteMap): void {
    this.selectedVentePourRetour = vente;
    this.retourVenteMotif = '';
    this.retourVenteLignes = (vente.produits || []).map((p: any) => ({
      ligneVenteId: p.id || p.ligneVenteId,
      produitId: p.produitId || p.id,
      produitNom: p.produitNom || p.nom || 'Produit',
      prixUnitaire: p.prixApresRemise || p.prixUnitaire || p.prixVente || 0,
      quantiteMax: p.quantite || 1,
      quantiteRetournee: p.quantite || 1,
      selected: true
    }));
    this.showRetourVenteModal = true;
  }

  submitRetourVente(): void {
    const lignesSel = this.retourVenteLignes.filter(l => l.selected && l.quantiteRetournee > 0);
    if (!lignesSel.length) {
      this.errorMessage = 'Sélectionnez au moins un produit à retourner';
      return;
    }
    let userId: number | undefined;
    try { const s = localStorage.getItem('currentUser'); if (s) userId = JSON.parse(s).id; } catch(e) {}

    const request: RetourVenteRequest = {
      venteId: this.selectedVentePourRetour!.id,
      motif: this.retourVenteMotif,
      utilisateurId: userId,
      lignes: lignesSel.map(l => ({
        ligneVenteId: l.ligneVenteId,
        produitId: l.produitId,
        quantiteRetournee: l.quantiteRetournee,
        prixUnitaire: l.prixUnitaire
      }))
    };

    const montantRetour = this.totalRetourVente;
    const numVente = this.selectedVentePourRetour!.numeroVente;

    Swal.fire({
      title: 'Confirmer le retour ?',
      html: `Retour de <strong>${this.formatPrice(montantRetour)}</strong> pour la vente <strong>${numVente}</strong>.<br>Le stock et la caisse seront mis à jour.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Valider le retour',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isLoading = true;
      this.productService.effectuerRetourVente(request).subscribe({
        next: () => {
          this.showRetourVenteModal = false;
          this.isLoading = false;
          this.loadData();
          this.loadProduits();
          Swal.fire({ icon: 'success', title: 'Retour enregistré', text: `Remboursement de ${this.formatPrice(montantRetour)} effectué.`, timer: 3000, timerProgressBar: true, confirmButtonColor: '#198754' });
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || err?.message || 'Erreur lors du retour';
          this.isLoading = false;
        }
      });
    });
  }
}