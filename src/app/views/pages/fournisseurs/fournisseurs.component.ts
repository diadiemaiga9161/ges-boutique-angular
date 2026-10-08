import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  ProductService,
  Fournisseur,
  FournisseurRequest,
  AchatFournisseur,
  PaiementFournisseur,
  PaiementFournisseurRequest,
  AvanceFournisseur,
  AvanceFournisseurRequest,
  FournisseurCompteDto,
  AchatFournisseurRequest,
  LigneAchatRequest,
  ProduitSimple,
  Categorie
} from '../../../shared/services/product.service';
import { AuthService } from '../../../shared/services/auth.service';
import { FactureService } from '../../../shared/services/facture.service';
import { CompteService, Compte } from '../../../shared/services/compte.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { formaterMessageWhatsApp, envoyerWhatsAppDirect } from '../../../shared/utils/whatsapp.util';
import { MontantInputDirective } from '../../../shared/directives/montant-input.directive';

import { MesurePuPipe, MesureQtePipe, MesureSuffixePipe } from '../../../shared/pipes/mesure.pipe';
import { infoMesure, prixAffiche, prixStocke, puDoc, qteDoc, qteStockee } from '../../../shared/utils/mesure.util';

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MontantInputDirective, MesureQtePipe, MesurePuPipe, MesureSuffixePipe],
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.scss']
})
export class FournisseursComponent implements OnInit {

  // ─── Navigation ────────────────────────────────────
  ongletActif: 'liste' | 'achats' | 'paiements' | 'situation' = 'liste';

  // ─── Données ───────────────────────────────────────
  fournisseurs: Fournisseur[] = [];
  comptes: Compte[] = [];
  achats: AchatFournisseur[] = [];
  paiements: PaiementFournisseur[] = [];
  avances: AvanceFournisseur[] = [];
  produits: ProduitSimple[] = [];
  situation: FournisseurCompteDto | null = null;
  achatsNonPayes: AchatFournisseur[] = [];

  // ─── Filtres ───────────────────────────────────────
  searchFournisseur = '';
  filtreFournisseurId = 0;
  filtreStatutAchat = '';

  // ─── Filtre période (achats / paiements / situation) ──
  periodePreset: 'jour' | 'semaine' | 'mois' | 'personnalise' | 'tout' = 'tout';
  filtreDateDebut = '';
  filtreDateFin = '';

  // ─── Chargement ────────────────────────────────────
  isLoading = false;
  isSaving = false;
  isLoadingSituation = false;

  // ─── Détail achat (ligne expandable) ──────────────
  achatDetail: any = null;
  achatDetailLoading = false;

  // ─── Annulation achat ─────────────────────────────
  isAnnulationEnCours = false;

  // ─── Modals ────────────────────────────────────────
  showFormModal = false;
  showAchatModal = false;
  showPaiementModal = false;
  showAvanceModal = false;
  showFicheModal = false;
  ficheFournisseurSelectionne: Fournisseur | null = null;
  isEditing = false;
  selectedFournisseur: Fournisseur | null = null;
  selectedAchat: AchatFournisseur | null = null;

  // ─── Avance fournisseur (utilisable lors d'un nouvel achat) ─────────
  // Fonctionnalité qui existait déjà côté backend (montantAvanceUtilise) et sur la page
  // Produit, mais jamais construite ici sur la vraie page Fournisseurs — ajoutée à la
  // demande du patron après vérification qu'elle manquait.
  avanceFournisseurDisponible = 0;
  avanceFournisseurUtilisee = 0;

  // ─── Formulaires ───────────────────────────────────
  fournisseurForm: FournisseurRequest = {
    nom: '', code: '', adresse: '', telephone: '', email: '',
    siteWeb: '', contactNom: '', contactTelephone: '', contactEmail: '',
    description: '', typeProduits: '', conditionsPaiement: '',
    delaiLivraison: undefined, note: undefined, actif: true
  };

  achatForm: AchatFournisseurRequest = {
    fournisseurId: 0,
    lignes: [],
    montantPaye: 0,
    commentaire: ''
  };

  /** Formulaire de saisie d'une ligne (produit existant ou nouveau) avant ajout à achatForm.lignes —
   *  même principe que la page Produit, pour pouvoir créer un produit directement depuis un achat. */
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
    quantite: number;
    prixAchatUnitaire: number;
  } = { quantite: 1, prixAchatUnitaire: 0 };

  categoriesPourNouveauProduit: Categorie[] = [];

  paiementForm: PaiementFournisseurRequest = {
    fournisseurId: 0, montant: 0, modePaiement: 'ESPECES',
    reference: '', observation: '', utilisateurId: undefined
  };

  avanceForm: AvanceFournisseurRequest = {
    fournisseurId: 0, montant: 0, motif: '',
    sourceFinancement: 'CAISSE', utilisateurId: undefined
  };

  // ─── Getters ───────────────────────────────────────
  get fournisseursFiltres(): Fournisseur[] {
    if (!this.searchFournisseur) return this.fournisseurs;
    const q = this.searchFournisseur.toLowerCase();
    return this.fournisseurs.filter(f =>
      f.nom.toLowerCase().includes(q) ||
      (f.code || '').toLowerCase().includes(q) ||
      (f.telephone || '').includes(q)
    );
  }

  get achatsFiltres(): AchatFournisseur[] {
    let liste = this.achats; // déjà filtrés par fournisseur via l'API
    if (this.filtreStatutAchat) liste = liste.filter(a => a.statut === this.filtreStatutAchat);
    return liste;
  }

  get totalAchatsFiltres(): number {
    return this.achatsFiltres.reduce((s, a) => s + (a.montantTotal || 0), 0);
  }

  get totalPayeFiltres(): number {
    return this.achatsFiltres.filter(a => a.statut !== 'ANNULE').reduce((s, a) => s + (a.montantPaye || 0), 0);
  }

  get totalRestantFiltres(): number {
    // BUG FIX (audit comptable) : cohérence avec totalPayeFiltres ci-dessus — un achat annulé
    // n'a plus de dette réelle. Le backend remet déjà montantRestant à 0 à l'annulation, mais on
    // filtre aussi ici par sécurité (ex: données historiques créées avant ce correctif backend,
    // pas encore corrigées rétroactivement en base).
    return this.achatsFiltres.filter(a => a.statut !== 'ANNULE').reduce((s, a) => s + (a.montantRestant || 0), 0);
  }

  get totalDetteFournisseurs(): number {
    return this.fournisseurs.reduce((s, f) => s + (f.solde || 0), 0);
  }

  get utilisateurActuelNom(): string {
    return this.authService?.getDisplayName() || 'Utilisateur';
  }

  get fournisseursSolde(): Fournisseur[] {
    return this.fournisseurs.filter(f => (f.solde || 0) > 0).sort((a, b) => (b.solde || 0) - (a.solde || 0));
  }

  getPaiementAuteur(p: any): string {
    return p?.utilisateurNom
      || p?.utilisateur?.nomComplet
      || p?.utilisateur?.username
      || p?.nomUtilisateur
      || p?.utilisateurName
      || this.utilisateurActuelNom;
  }

  get totalAchatsGlobal(): number {
    return this.fournisseurs.reduce((s, f) => s + (f.totalAchats || 0), 0);
  }

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private http: HttpClient,
    private factureService: FactureService,
    private compteService: CompteService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit(): void {
    this.chargerFournisseurs();
    this.chargerProduits();
    this.chargerComptes();
  }

  // ══════════════════════════════════════════
  // CHARGEMENT
  // ══════════════════════════════════════════

  chargerFournisseurs(): void {
    this.isLoading = true;
    this.productService.getAllFournisseurs().subscribe({
      next: data => { this.fournisseurs = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  /** Retourne dateDebut/dateFin à passer au service seulement si un préréglage de période est actif. */
  private get periodeActive(): { dateDebut?: string; dateFin?: string } {
    if (this.periodePreset === 'tout' || !this.filtreDateDebut || !this.filtreDateFin) return {};
    return { dateDebut: this.filtreDateDebut, dateFin: this.filtreDateFin };
  }

  chargerAchats(): void {
    if (!this.filtreFournisseurId) {
      Swal.fire({ icon: 'info', title: 'Sélectionnez un fournisseur', text: 'Choisissez un fournisseur pour voir ses achats.', timer: 2000, showConfirmButton: false });
      return;
    }
    this.isLoading = true;
    const { dateDebut, dateFin } = this.periodeActive;
    this.productService.getHistoriqueAchats(this.filtreFournisseurId, dateDebut, dateFin).subscribe({
      next: data => { this.achats = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  chargerPaiements(): void {
    if (!this.filtreFournisseurId) return;
    const { dateDebut, dateFin } = this.periodeActive;
    this.productService.getHistoriquePaiements(this.filtreFournisseurId, dateDebut, dateFin).subscribe({
      next: data => this.paiements = data,
      error: () => {}
    });
    this.productService.getHistoriqueAvancesFournisseur(this.filtreFournisseurId).subscribe({
      next: data => this.avances = data,
      error: () => {}
    });
  }

  chargerSituation(): void {
    if (!this.filtreFournisseurId) {
      Swal.fire({ icon: 'info', title: 'Sélectionnez un fournisseur', text: 'Choisissez un fournisseur pour voir sa situation.', timer: 2000, showConfirmButton: false });
      return;
    }
    this.isLoadingSituation = true;
    const { dateDebut, dateFin } = this.periodeActive;
    this.productService.getSituationFournisseur(this.filtreFournisseurId, dateDebut, dateFin).subscribe({
      next: data => { this.situation = data; this.isLoadingSituation = false; },
      error: () => { this.isLoadingSituation = false; }
    });
  }

  chargerAchatsNonPayes(): void {
    if (!this.filtreFournisseurId) { this.achatsNonPayes = []; return; }
    this.productService.getAchatsNonPayes(this.filtreFournisseurId).subscribe({
      next: data => this.achatsNonPayes = data,
      error: () => this.achatsNonPayes = []
    });
  }

  getPayerLabel(payment: any): string {
    return payment?.utilisateurNom
      || payment?.utilisateur?.nomComplet
      || payment?.utilisateur?.username
      || payment?.effectuePar
      || this.authService.getDisplayName();
  }

  // ══════════════════════════════════════════
  // FILTRE PÉRIODE (Achats / Paiements / Situation)
  // ══════════════════════════════════════════

  private formaterDateLocale(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  appliquerPreset(preset: 'jour' | 'semaine' | 'mois' | 'personnalise' | 'tout'): void {
    this.periodePreset = preset;
    const aujourdhui = new Date();

    if (preset === 'jour') {
      this.filtreDateDebut = this.formaterDateLocale(aujourdhui);
      this.filtreDateFin = this.formaterDateLocale(aujourdhui);
    } else if (preset === 'semaine') {
      const debut = new Date(aujourdhui);
      debut.setDate(debut.getDate() - 7);
      this.filtreDateDebut = this.formaterDateLocale(debut);
      this.filtreDateFin = this.formaterDateLocale(aujourdhui);
    } else if (preset === 'mois') {
      const debut = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
      this.filtreDateDebut = this.formaterDateLocale(debut);
      this.filtreDateFin = this.formaterDateLocale(aujourdhui);
    } else if (preset === 'tout') {
      this.filtreDateDebut = '';
      this.filtreDateFin = '';
    }
    // 'personnalise' : on ne touche pas aux dates, l'utilisateur les choisit via les inputs

    if (preset !== 'personnalise') this.rechargerOngletActif();
  }

  /** Relance le chargement de l'onglet Achats/Paiements/Situation actuellement affiché. */
  rechargerOngletActif(): void {
    if (!this.filtreFournisseurId) return;
    if (this.ongletActif === 'achats') this.chargerAchats();
    if (this.ongletActif === 'paiements') this.chargerPaiements();
    if (this.ongletActif === 'situation') this.chargerSituation();
  }

  chargerProduits(): void {
    this.productService.getProduitsSimples().subscribe({
      next: data => this.produits = data,
      error: () => {}
    });
  }

  chargerComptes(): void {
    this.compteService.getTousLesComptes().subscribe({
      next: data => this.comptes = data,
      error: () => this.comptes = []
    });
  }

  changerOnglet(onglet: 'liste' | 'achats' | 'paiements' | 'situation'): void {
    this.ongletActif = onglet;
    if (onglet === 'achats' && this.filtreFournisseurId) this.chargerAchats();
    if (onglet === 'paiements' && this.filtreFournisseurId) this.chargerPaiements();
    if (onglet === 'situation' && this.filtreFournisseurId) {
      this.chargerSituation();
      if (!this.achatsNonPayes.length) this.chargerAchatsNonPayes();
    }
  }

  onFournisseurChange(): void {
    this.achats = [];
    this.paiements = [];
    this.avances = [];
    this.situation = null;
    this.achatsNonPayes = [];
    if (this.ongletActif === 'achats') this.chargerAchats();
    if (this.ongletActif === 'paiements') this.chargerPaiements();
    if (this.ongletActif === 'situation') this.chargerSituation();
    if (this.filtreFournisseurId) this.chargerAchatsNonPayes();
  }

  // ══════════════════════════════════════════
  // FOURNISSEUR CRUD
  // ══════════════════════════════════════════

  ouvrirFormulaire(f?: Fournisseur): void {
    this.isEditing = !!f;
    this.selectedFournisseur = f || null;
    if (f) {
      this.fournisseurForm = {
        nom: f.nom, code: f.code, adresse: f.adresse || '', telephone: f.telephone || '',
        email: f.email || '', siteWeb: f.siteWeb || '', contactNom: f.contactNom || '',
        contactTelephone: f.contactTelephone || '', contactEmail: f.contactEmail || '',
        description: f.description || '', typeProduits: f.typeProduits || '',
        conditionsPaiement: f.conditionsPaiement || '', delaiLivraison: f.delaiLivraison,
        note: f.note, actif: f.actif
      };
    } else {
      this.fournisseurForm = {
        nom: '', code: '', adresse: '', telephone: '', email: '',
        siteWeb: '', contactNom: '', contactTelephone: '', contactEmail: '',
        description: '', typeProduits: '', conditionsPaiement: '',
        delaiLivraison: undefined, note: undefined, actif: true
      };
    }
    this.showFormModal = true;
  }

  enregistrerFournisseur(): void {
    if (!this.fournisseurForm.nom?.trim()) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Le nom du fournisseur est obligatoire.' }); return;
    }
    if (!this.fournisseurForm.code?.trim()) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Le code du fournisseur est obligatoire.' }); return;
    }
    this.isSaving = true;
    const obs = this.isEditing && this.selectedFournisseur
      ? this.productService.updateFournisseur(this.selectedFournisseur.id, this.fournisseurForm)
      : this.productService.createFournisseur(this.fournisseurForm);

    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.showFormModal = false;
        this.chargerFournisseurs();
        Swal.fire({ icon: 'success', title: 'Succès', text: this.isEditing ? 'Fournisseur modifié.' : 'Fournisseur créé.', timer: 2000, showConfirmButton: false });
      },
      error: err => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Enregistrement impossible.' });
      }
    });
  }

  confirmerSupprimer(f: Fournisseur): void {
    Swal.fire({
      icon: 'warning', title: 'Supprimer ce fournisseur ?',
      text: `"${f.nom}" sera supprimé définitivement.`,
      showCancelButton: true, confirmButtonColor: '#dc2626',
      confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.productService.deleteFournisseur(f.id).subscribe({
          next: () => { this.chargerFournisseurs(); Swal.fire({ icon: 'success', title: 'Supprimé', timer: 1500, showConfirmButton: false }); },
          error: err => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Suppression impossible.' })
        });
      }
    });
  }

  // ══════════════════════════════════════════
  // ACHAT
  // ══════════════════════════════════════════

  ouvrirAchatModal(fournisseur?: Fournisseur): void {
    const fId = fournisseur?.id || this.filtreFournisseurId;
    this.achatForm = {
      fournisseurId: fId,
      lignes: [],
      montantPaye: 0, commentaire: ''
    };
    this.tempLigneAchat = { quantite: 1, prixAchatUnitaire: 0 };
    this.loadCategoriesForNewProduct();
    this.avanceFournisseurUtilisee = 0;
    this.avanceFournisseurDisponible = 0;
    this.rafraichirAvanceDisponible();
    this.showAchatModal = true;
  }

  /** Recharge le solde d'avance disponible pour le fournisseur actuellement choisi dans le
   *  formulaire d'achat (appelé à l'ouverture de la modale et si l'utilisateur change de
   *  fournisseur dans le select). Remet aussi le montant déduit à 0 pour éviter de déduire
   *  un montant qui dépasserait l'avance du nouveau fournisseur sélectionné. */
  rafraichirAvanceDisponible(): void {
    this.avanceFournisseurUtilisee = 0;
    if (!this.achatForm.fournisseurId) { this.avanceFournisseurDisponible = 0; return; }
    this.productService.getSoldeAvanceFournisseur(this.achatForm.fournisseurId).subscribe({
      next: solde => this.avanceFournisseurDisponible = solde || 0,
      error: () => this.avanceFournisseurDisponible = 0
    });
  }

  /** Plafond de l'avance utilisable : jamais plus que l'avance dispo, ni plus que le total de l'achat. */
  get maxAvanceUtilisable(): number {
    return Math.min(this.avanceFournisseurDisponible, this.montantTotalAchat);
  }

  private loadCategoriesForNewProduct(): void {
    this.productService.getAllCategories().subscribe({
      next: categories => this.categoriesPourNouveauProduit = categories,
      error: () => this.categoriesPourNouveauProduit = []
    });
  }

  /** Pré-remplit le prix d'achat avec le prix catalogue actuel quand on choisit un produit existant. */
  onProduitSelectionne(): void {
    const produit = this.produits.find(p => p.id === this.tempLigneAchat.produitId);
    if (produit) {
      this.tempLigneAchat.produitNom = produit.nom;
      // prix au kg pour un produit vendu à la mesure
      this.tempLigneAchat.prixAchatUnitaire = Math.round(prixAffiche(produit as any, produit.prixAchat) * 100) / 100;
    }
  }

  /** Produit existant choisi dans la ligne d'achat, s'il est vendu au kg/L/m. */
  get produitAchatMesure(): any {
    const id = this.tempLigneAchat?.produitId;
    const p: any = id ? (this.produits as any[]).find(x => x.id === +id) : null;
    return infoMesure(p) ? p : null;
  }

  /** Ajoute la ligne en cours de saisie (produit existant ou nouveau produit) à l'achat. */
  ajouterLigneAchat(): void {
    if (!this.tempLigneAchat.quantite || this.tempLigneAchat.quantite <= 0) {
      Swal.fire({ icon: 'error', title: 'Quantité invalide' }); return;
    }
    if (!this.tempLigneAchat.prixAchatUnitaire || this.tempLigneAchat.prixAchatUnitaire <= 0) {
      Swal.fire({ icon: 'error', title: 'Prix d\'achat unitaire invalide' }); return;
    }
    if (!this.tempLigneAchat.produitId && !this.tempLigneAchat.nouveauProduitNom?.trim()) {
      Swal.fire({ icon: 'error', title: 'Choisissez un produit', text: 'Sélectionnez un produit existant ou renseignez le nom du nouveau produit.' }); return;
    }

    // Vente à la mesure : saisie en kg et prix au kg, envoyés en g et prix au g.
    const mesure: any = this.produitAchatMesure;
    const nouvelleLigne: LigneAchatRequest = {
      quantite: mesure ? qteStockee(mesure, this.tempLigneAchat.quantite) : this.tempLigneAchat.quantite,
      prixAchatUnitaire: mesure ? prixStocke(mesure, this.tempLigneAchat.prixAchatUnitaire) : this.tempLigneAchat.prixAchatUnitaire
    };
    if (mesure) (nouvelleLigne as any).modeMesure = mesure.modeMesure;
    if (this.tempLigneAchat.produitId) {
      nouvelleLigne.produitId = this.tempLigneAchat.produitId;
    }
    if (this.tempLigneAchat.nouveauProduitNom?.trim()) {
      nouvelleLigne.nouveauProduitNom = this.tempLigneAchat.nouveauProduitNom.trim();
      nouvelleLigne.nouvelleCategorieId = this.tempLigneAchat.nouvelleCategorieId;
      nouvelleLigne.prixVente = this.tempLigneAchat.prixVente;
      nouvelleLigne.description = this.tempLigneAchat.description;
      nouvelleLigne.codeBarre = this.tempLigneAchat.codeBarre;
      nouvelleLigne.seuilAlerte = this.tempLigneAchat.seuilAlerte;
      nouvelleLigne.uniteMesure = this.tempLigneAchat.uniteMesure;
      nouvelleLigne.bio = this.tempLigneAchat.bio || false;
      nouvelleLigne.origine = this.tempLigneAchat.origine;
    }
    this.achatForm.lignes.push(nouvelleLigne);
    this.tempLigneAchat = { quantite: 1, prixAchatUnitaire: 0 };
  }

  supprimerLigneAchat(index: number): void {
    this.achatForm.lignes.splice(index, 1);
  }

  /** Nom à afficher pour une ligne d'achat déjà ajoutée (produit existant retrouvé dans le catalogue, ou nouveau produit). */
  nomProduitLigne(ligne: LigneAchatRequest): string {
    if (ligne.nouveauProduitNom) return ligne.nouveauProduitNom;
    const produit = this.produits.find(p => p.id === ligne.produitId);
    return produit?.nom || 'Produit';
  }

  get montantTotalAchat(): number {
    return this.achatForm.lignes.reduce((s, l) => s + ((l.quantite || 0) * (l.prixAchatUnitaire || 0)), 0);
  }

  /**
   * Calcule, pour chaque ligne dont le prix d'achat saisi diffère du prix d'achat actuel du produit,
   * le nouveau prix d'achat proposé via le coût moyen pondéré (CUMP) :
   * (stockActuel × ancienPrixAchat + quantitéEntrée × prixAchatEntrée) / (stockActuel + quantitéEntrée)
   * Si le stock actuel est à 0, le nouveau prix = simplement le prix d'achat de l'entrée.
   * Les lignes "nouveau produit" (sans produitId) n'ont pas d'ancien prix à comparer et sont ignorées ici.
   */
  private calculerPropositionsCUMP(): {
    ligne: LigneAchatRequest;
    produitNom: string;
    stockActuel: number;
    ancienPrix: number;
    quantiteEntree: number;
    prixEntree: number;
    nouveauPrix: number;
  }[] {
    const propositions: {
      ligne: LigneAchatRequest;
      produitNom: string;
      stockActuel: number;
      ancienPrix: number;
      quantiteEntree: number;
      prixEntree: number;
      nouveauPrix: number;
    }[] = [];

    for (const ligne of this.achatForm.lignes) {
      if (!ligne.produitId) continue;
      const produit = this.produits.find(p => p.id === ligne.produitId);
      if (!produit) continue;

      const ancienPrix = produit.prixAchat || 0;
      const prixEntree = ligne.prixAchatUnitaire || 0;
      if (prixEntree === ancienPrix) continue; // aucune différence de prix

      const stockActuel = produit.quantite || 0;
      const quantiteEntree = ligne.quantite || 0;
      const nouveauPrix = stockActuel === 0
        ? prixEntree
        : (stockActuel * ancienPrix + quantiteEntree * prixEntree) / (stockActuel + quantiteEntree);

      propositions.push({ ligne, produitNom: produit.nom, stockActuel, ancienPrix, quantiteEntree, prixEntree, nouveauPrix, mesure: produit } as any);
    }

    return propositions;
  }

  /** Popup de confirmation (SweetAlert2) : nouveau prix d'achat moyen proposé, sans formule. */
  private demanderConfirmationCUMP(propositions: { produitNom: string; stockActuel: number; ancienPrix: number; quantiteEntree: number; prixEntree: number; nouveauPrix: number; }[]): Promise<boolean> {
    const escapeHtml = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const ligne = (libelle: string, valeur: string, fort = false) => `
      <div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;${fort ? 'font-weight:700;color:var(--success);' : ''}">
        <span style="${fort ? '' : 'color:var(--text-muted);'}">${libelle}</span><span>${valeur}</span>
      </div>`;
    const fichesHtml = propositions.map(p => {
      const mesure = (p as any).mesure;
      const prix = (v: number) => puDoc(mesure, x => this.fmt(x), v);
      const note = p.stockActuel > 0
        ? `Le prix moyen tient compte des ${qteDoc(mesure, p.stockActuel)}${mesure?.modeMesure ? '' : ' unité(s)'} déjà en stock.`
        : 'Aucun stock en boutique : le nouveau prix est celui de cet achat.';
      return `
      <div style="text-align:left;border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:10px;">
        <div style="font-weight:700;margin-bottom:6px;">${escapeHtml(p.produitNom)}</div>
        ${ligne("Prix d'achat actuel", prix(p.ancienPrix))}
        ${ligne('Prix de cet achat', prix(p.prixEntree))}
        ${ligne('Prix moyen proposé', prix(p.nouveauPrix), true)}
        <div style="color:var(--text-muted);font-size:0.85em;margin-top:6px;">${note}</div>
      </div>`;
    }).join('');

    return Swal.fire({
      title: "Prix d'achat modifié",
      html: `
        <p style="margin-bottom:12px;">Le prix de cet achat est différent du prix enregistré.
        Mettre à jour le prix d'achat avec le prix moyen ?</p>
        ${fichesHtml}
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, mettre à jour le prix',
      cancelButtonText: 'Non, garder le prix actuel',
      width: 520
    }).then(result => result.isConfirmed);
  }

  enregistrerAchat(): void {
    if (!this.achatForm.fournisseurId) {
      Swal.fire({ icon: 'warning', title: 'Fournisseur requis', text: 'Sélectionnez un fournisseur.' }); return;
    }
    if (!this.achatForm.lignes.length) {
      Swal.fire({ icon: 'warning', title: 'Aucun produit', text: 'Ajoutez au moins un produit à l\'achat.' }); return;
    }
    // Une ligne est valide si elle référence un produit existant OU un nouveau produit (nom renseigné).
    if (this.achatForm.lignes.some(l => (!l.produitId && !l.nouveauProduitNom) || !l.quantite || !l.prixAchatUnitaire)) {
      Swal.fire({ icon: 'warning', title: 'Lignes incomplètes', text: 'Renseignez produit, quantité et prix pour chaque ligne.' }); return;
    }
    if ((this.avanceFournisseurUtilisee || 0) > this.maxAvanceUtilisable) {
      Swal.fire({ icon: 'warning', title: 'Avance trop élevée', text: `Le montant déduit de l'avance ne peut pas dépasser ${this.fmt(this.maxAvanceUtilisable)}.` }); return;
    }
    if ((this.achatForm.montantPaye || 0) > this.montantTotalAchat) {
      Swal.fire({ icon: 'warning', title: 'Montant payé trop élevé', text: `Le montant payé ne peut pas dépasser le total de l'achat : ${this.fmt(this.montantTotalAchat)}.` }); return;
    }

    const propositionsCUMP = this.calculerPropositionsCUMP();
    if (propositionsCUMP.length > 0) {
      this.demanderConfirmationCUMP(propositionsCUMP).then(accepte => {
        propositionsCUMP.forEach(p => {
          p.ligne.nouveauPrixAchat = accepte ? p.nouveauPrix : undefined;
        });
        this.soumettreAchat();
      });
    } else {
      this.soumettreAchat();
    }
  }

  private soumettreAchat(): void {
    this.isSaving = true;
    const payload: AchatFournisseurRequest = {
      ...this.achatForm,
      utilisateurId: this.authService.getUserId() || undefined,
      montantAvanceUtilise: this.avanceFournisseurUtilisee || 0
    };
    this.productService.creerAchat(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAchatModal = false;
        if (this.filtreFournisseurId) this.chargerAchats();
        this.chargerFournisseurs();
        Swal.fire({ icon: 'success', title: 'Achat enregistré', timer: 2000, showConfirmButton: false });
      },
      error: err => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Enregistrement impossible.' });
      }
    });
  }

  // ══════════════════════════════════════════
  // PAIEMENT
  // ══════════════════════════════════════════

  ouvrirPaiementModal(achat?: AchatFournisseur): void {
    const fId = achat?.fournisseur?.id || this.filtreFournisseurId;
    this.paiementForm = {
      fournisseurId: fId,
      montant: achat ? achat.montantRestant : 0,
      modePaiement: 'ESPECES', reference: '', observation: '',
      compteId: undefined,
      achatCibleId: achat?.id,
      utilisateurId: this.authService.getUserId() || undefined
    };
    this.selectedAchat = achat || null;
    this.showPaiementModal = true;
  }

  enregistrerPaiement(): void {
    if (!this.paiementForm.fournisseurId) {
      Swal.fire({ icon: 'warning', title: 'Fournisseur requis' }); return;
    }
    if (!this.paiementForm.montant || this.paiementForm.montant <= 0) {
      Swal.fire({ icon: 'warning', title: 'Montant invalide', text: 'Le montant doit être supérieur à 0.' }); return;
    }
    if (this.paiementForm.modePaiement === 'BANQUE' && !this.paiementForm.compteId) {
      Swal.fire({ icon: 'warning', title: 'Compte bancaire requis', text: 'Choisissez un compte bancaire pour ce paiement.' }); return;
    }
    this.isSaving = true;
    // Trace qui a effectué le paiement dans l'observation — aucune colonne
    // "utilisateur" dédiée dans le tableau des paiements, donc on l'ajoute
    // au texte affiché dans la colonne Observation.
    const auteur = `Payé par ${this.authService.getDisplayName()}`;
    const observation = this.paiementForm.observation?.trim()
      ? `${auteur} — ${this.paiementForm.observation.trim()}`
      : auteur;
    this.productService.payerFournisseur({ ...this.paiementForm, observation, utilisateurId: this.authService.getUserId() || undefined }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showPaiementModal = false;
        if (this.filtreFournisseurId) { this.chargerAchats(); this.chargerPaiements(); }
        this.chargerFournisseurs();
        Swal.fire({ icon: 'success', title: 'Paiement enregistré', timer: 2000, showConfirmButton: false });
      },
      error: err => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Paiement impossible.' });
      }
    });
  }

  // ══════════════════════════════════════════
  // AVANCE
  // ══════════════════════════════════════════

  ouvrirAvanceModal(): void {
    this.avanceForm = {
      fournisseurId: this.filtreFournisseurId,
      montant: 0, motif: '', sourceFinancement: 'CAISSE',
      compteId: undefined,
      utilisateurId: this.authService.getUserId() || undefined
    };
    this.showAvanceModal = true;
  }

  enregistrerAvance(): void {
    if (!this.avanceForm.fournisseurId) {
      Swal.fire({ icon: 'warning', title: 'Fournisseur requis' }); return;
    }
    if (!this.avanceForm.montant || this.avanceForm.montant <= 0) {
      Swal.fire({ icon: 'warning', title: 'Montant invalide' }); return;
    }
    if (this.avanceForm.sourceFinancement === 'BANQUE' && !this.avanceForm.compteId) {
      Swal.fire({ icon: 'warning', title: 'Compte bancaire requis', text: 'Choisissez un compte bancaire pour cette avance.' }); return;
    }
    this.isSaving = true;
    this.productService.enregistrerAvanceFournisseur({ ...this.avanceForm, utilisateurId: this.authService.getUserId() || undefined }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAvanceModal = false;
        if (this.filtreFournisseurId) this.chargerPaiements();
        Swal.fire({ icon: 'success', title: 'Avance enregistrée', timer: 2000, showConfirmButton: false });
      },
      error: err => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Avance impossible.' });
      }
    });
  }

  // ══════════════════════════════════════════
  // ANNULATION ACHAT
  // ══════════════════════════════════════════

  confirmerAnnulerAchat(achat: AchatFournisseur): void {
    Swal.fire({
      icon: 'warning',
      title: 'Annuler cet achat ?',
      text: `L'achat #${achat.id} sera annulé et le stock sera restauré.`,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.isAnnulationEnCours = true;
      this.productService.annulerAchatFournisseur(achat.id, this.authService.getUserId() || undefined).subscribe({
        next: () => {
          this.isAnnulationEnCours = false;
          if (this.filtreFournisseurId) this.chargerAchats();
          this.chargerFournisseurs();
          Swal.fire({ icon: 'success', title: 'Achat annulé', text: 'Le stock a été restauré.', timer: 2000, showConfirmButton: false });
        },
        error: err => {
          this.isAnnulationEnCours = false;
          Swal.fire({ icon: 'error', title: 'Erreur', text: err?.message || 'Annulation impossible.' });
        }
      });
    });
  }

  // ══════════════════════════════════════════
  // DÉTAIL ACHAT — PRODUITS PAR ACHAT
  // ══════════════════════════════════════════

  toggleDetailAchat(achat: any): void {
    if (this.achatDetail?.id === achat.id) {
      this.achatDetail = null;
      return;
    }
    this.achatDetailLoading = true;
    this.http.get<any>(
      `${environment.apiUrl}/fournisseur-achats/achat/${achat.id}`,
      this.authService.getAuthOptions()
    ).subscribe({
      next: (detail) => {
        this.achatDetail = detail;
        this.achatDetailLoading = false;
      },
      error: () => {
        this.achatDetailLoading = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger le détail de cet achat.', timer: 2500, showConfirmButton: false });
      }
    });
  }

  // ─── Top produits achetés (depuis historique chargé) ──
  get topProduits(): { nom: string; quantite: number; total: number }[] {
    const map = new Map<string, { quantite: number; total: number }>();
    (this.achats || []).forEach(achat => {
      const lignes = (achat as any).ligneAchats || (achat as any).lignes || [];
      lignes.forEach((ligne: any) => {
        const nom = ligne.nomProduit || ligne.produit?.nom || 'Produit';
        const existing = map.get(nom) || { quantite: 0, total: 0 };
        map.set(nom, {
          quantite: existing.quantite + (ligne.quantite || 0),
          total: existing.total + (ligne.total || ligne.sousTotal || (ligne.quantite || 0) * (ligne.prixAchatUnitaire || 0))
        });
      });
    });
    return Array.from(map.entries())
      .map(([nom, data]) => ({ nom, ...data }))
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);
  }

  get resumeMensuelProduits(): { nom: string; quantite: number; total: number }[] {
    const now = new Date();
    const moisCourant = now.getMonth();
    const anneeCourante = now.getFullYear();
    const map = new Map<string, { quantite: number; total: number }>();

    (this.achats || []).forEach(achat => {
      const dateStr = (achat as any).dateAchat || (achat as any).dateCreation;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (date.getMonth() !== moisCourant || date.getFullYear() !== anneeCourante) return;
      const lignes = (achat as any).ligneAchats || (achat as any).lignes || [];
      lignes.forEach((ligne: any) => {
        const nom = ligne.nomProduit || ligne.produit?.nom || 'Produit';
        const existing = map.get(nom) || { quantite: 0, total: 0 };
        map.set(nom, {
          quantite: existing.quantite + (ligne.quantite || 0),
          total: existing.total + (ligne.total || ligne.sousTotal || (ligne.quantite || 0) * (ligne.prixAchatUnitaire || 0))
        });
      });
    });

    return Array.from(map.entries()).map(([nom, data]) => ({ nom, ...data }));
  }

  /** Message WhatsApp complet (boutique, fournisseur, période, détail, totaux) pour un document PDF fournisseur. */
  private whatsAppFournisseur(fournisseur: any, titreDocument: string, totaux: { label: string; valeur: string }[], lignesDetail?: string[]): { telephone?: string; message: string } {
    const boutique = this.boutiqueService.getInfo();
    return {
      telephone: fournisseur?.telephone,
      message: formaterMessageWhatsApp({
        boutiqueNom: boutique.nom || 'Ges Boutique',
        boutiqueTelephone: boutique.telephone,
        titreDocument,
        personneLabel: 'Fournisseur',
        personneNom: `${fournisseur?.nom || ''}${fournisseur?.code ? ' (' + fournisseur.code + ')' : ''}`,
        date: new Date().toLocaleDateString('fr-FR'),
        lignes: lignesDetail,
        totaux,
        notePied: this.libellePeriodePdf()
      })
    };
  }

  /** Envoi direct par WhatsApp d'un achat précis (bouton dans la liste, sans passer par l'aperçu PDF). */
  envoyerAchatWhatsApp(achat: any): void {
    const fournisseur = this.fournisseurs.find(f => f.id === this.filtreFournisseurId);
    if (!fournisseur) return;
    const lignesDetail = (achat.lignes || []).map((l: any) => `${l.produit?.nom || '?'} ×${qteDoc(l)}`);
    const { telephone, message } = this.whatsAppFournisseur(
      fournisseur,
      `Achat N°${achat.id}`,
      [
        { label: 'Total', valeur: this.fmt(achat.montantTotal) },
        { label: 'Payé', valeur: this.fmt(achat.montantPaye) },
        { label: 'Restant', valeur: this.fmt(achat.montantRestant) }
      ],
      lignesDetail
    );
    if (!envoyerWhatsAppDirect(telephone, message)) {
      Swal.fire({ icon: 'info', title: 'Aucun numéro enregistré', text: 'Ajoutez un numéro de téléphone à ce fournisseur pour activer l\'envoi WhatsApp.', timer: 3000, showConfirmButton: false });
    }
  }

  /** Envoi direct par WhatsApp de la situation du fournisseur actuellement affichée. */
  envoyerSituationWhatsApp(): void {
    if (!this.situation) return;
    const f = this.situation.fournisseur;
    const { telephone, message } = this.whatsAppFournisseur(f, 'Situation fournisseur', [
      { label: 'Total achats', valeur: this.fmt(this.situation.totalAchats) },
      { label: 'Total payé', valeur: this.fmt(this.situation.totalPaye) },
      { label: 'Solde dû', valeur: this.fmt(this.situation.solde) }
    ]);
    if (!envoyerWhatsAppDirect(telephone, message)) {
      Swal.fire({ icon: 'info', title: 'Aucun numéro enregistré', text: 'Ajoutez un numéro de téléphone à ce fournisseur pour activer l\'envoi WhatsApp.', timer: 3000, showConfirmButton: false });
    }
  }

  // ══════════════════════════════════════════
  // PDF — ACHATS FOURNISSEUR
  // ══════════════════════════════════════════

  telechargerPdfAchats(): void {
    const fournisseur = this.fournisseurs.find(f => f.id === this.filtreFournisseurId);
    if (!fournisseur || !this.achatsFiltres.length) {
      Swal.fire({ icon: 'info', title: 'Aucune donnée', text: 'Sélectionnez un fournisseur et chargez ses achats.' }); return;
    }

    const lignes = this.achatsFiltres.map(a => [
      `#${a.id}`,
      this.formatDate(a.dateAchat || a.dateCreation),
      (a.lignes || []).map((l: any) => `${l.produit?.nom || '?'} ×${qteDoc(l)}`).join(', ') || '—',
      this.fmt(a.montantTotal),
      this.fmt(a.montantPaye),
      this.fmt(a.montantRestant),
      this.statutLabel(a.statut),
      a.commentaire || '—'
    ]);

    const totauxAchats = [
      { label: 'Total achats', valeur: this.fmt(this.totalAchatsFiltres) },
      { label: 'Total payé', valeur: this.fmt(this.totalPayeFiltres) },
      { label: 'Reste à payer', valeur: this.fmt(this.totalRestantFiltres) }
    ];
    const lignesDetailWa = this.achatsFiltres.map(a =>
      `Achat #${a.id} du ${this.formatDate(a.dateAchat || a.dateCreation)} — ${this.fmt(a.montantTotal)} (payé ${this.fmt(a.montantPaye)}, restant ${this.fmt(a.montantRestant)})`
    );

    this.factureService.ouvrirDocumentPDF({
      titre: 'Achats fournisseur',
      sousTitre: `${fournisseur.nom} (${fournisseur.code || '—'}) — ${this.libellePeriodePdf()}`,
      colonnes: ['N°', 'Date', 'Produits', 'Total', 'Payé', 'Restant', 'Statut', 'Commentaire'],
      lignes,
      totaux: totauxAchats,
      pied: `${this.achatsFiltres.length} achat(s) — ${this.libellePeriodePdf()} — Document confidentiel`,
      whatsapp: this.whatsAppFournisseur(fournisseur, 'Achats fournisseur', totauxAchats, lignesDetailWa)
    });
  }

  // ══════════════════════════════════════════
  // PDF — PAIEMENTS FOURNISSEUR
  // ══════════════════════════════════════════

  telechargerPdfPaiements(): void {
    const fournisseur = this.fournisseurs.find(f => f.id === this.filtreFournisseurId);
    if (!fournisseur || !this.paiements.length) {
      Swal.fire({ icon: 'info', title: 'Aucune donnée', text: 'Sélectionnez un fournisseur et chargez ses paiements.' }); return;
    }

    const lignes = this.paiements.map(p => [
      this.formatDate(p.datePaiement),
      this.fmt(p.montant),
      p.modePaiement || '—',
      p.reference || '—',
      p.observation || '—'
    ]);

    const totalPaiements = this.paiements.reduce((s, p) => s + (p.montant || 0), 0);
    const totauxPaiements = [{ label: 'Total payé', valeur: this.fmt(totalPaiements) }];
    const lignesDetailWa = this.paiements.map(p =>
      `${this.formatDate(p.datePaiement)} — ${this.fmt(p.montant)} (${p.modePaiement || '—'}${p.reference ? ', réf. ' + p.reference : ''})`
    );

    this.factureService.ouvrirDocumentPDF({
      titre: 'Paiements fournisseur',
      sousTitre: `${fournisseur.nom} (${fournisseur.code || '—'}) — ${this.libellePeriodePdf()}`,
      colonnes: ['Date', 'Montant', 'Mode', 'Référence', 'Observation'],
      lignes,
      totaux: totauxPaiements,
      pied: `${this.paiements.length} paiement(s) — ${this.libellePeriodePdf()} — Document confidentiel`,
      whatsapp: this.whatsAppFournisseur(fournisseur, 'Paiements fournisseur', totauxPaiements, lignesDetailWa)
    });
  }

  // ══════════════════════════════════════════
  // PDF — SITUATION FOURNISSEUR
  // ══════════════════════════════════════════

  telechargerPdfSituation(): void {
    if (!this.situation) {
      Swal.fire({ icon: 'info', title: 'Aucune situation', text: 'Chargez d\'abord la situation du fournisseur.' }); return;
    }
    const f = this.situation.fournisseur;

    // Détail chronologique des achats + paiements (pas seulement le résumé),
    // pour obtenir un vrai relevé exploitable comme pour la situation client.
    type OperationSituation = { date: string; type: 'Achat' | 'Paiement'; detail: string; montant: number; info: string };
    const statutLabels: { [k: string]: string } = { EN_COURS: 'En cours', PAYE: 'Payé', ANNULE: 'Annulé' };

    const operations: OperationSituation[] = [
      ...(this.situation.achatsRecents || []).map(a => ({
        date: a.dateAchat,
        type: 'Achat' as const,
        detail: a.commentaire || `Achat #${a.id}`,
        montant: a.montantTotal,
        info: `${statutLabels[a.statut] || a.statut} — payé ${this.fmt(a.montantPaye)} / restant ${this.fmt(a.montantRestant)}`
      })),
      ...(this.situation.paiementsRecents || []).map(p => ({
        date: p.datePaiement,
        type: 'Paiement' as const,
        detail: p.reference || p.observation || `Paiement #${p.id}`,
        montant: p.montant,
        info: p.modePaiement || '—'
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const lignesDetail: any[][] = operations.map(o => [
      this.formatDate(o.date),
      o.type,
      o.detail,
      this.fmt(o.montant),
      o.info
    ]);

    const piedParts: string[] = [
      `${f.telephone ? 'Tél : ' + f.telephone + ' — ' : ''}${f.email ? 'Email : ' + f.email : ''}`,
      `Adresse : ${f.adresse || '—'} | Type produits : ${f.typeProduits || '—'} | Statut : ${f.actif ? 'Actif' : 'Inactif'}`
    ];

    // Les totaux renvoyés par le serveur (totalAchats/totalPaye/solde) sont toujours
    // calculés sur toute la durée, même quand une période est filtrée (seule la liste
    // achatsRecents/paiementsRecents respecte le filtre côté serveur). Pour que les totaux
    // affichés correspondent réellement à la période choisie, on les recalcule ici à partir
    // des opérations déjà filtrées dès qu'une période précise est active.
    const { dateDebut, dateFin } = this.periodeActive;
    const periodeFiltreeActive = !!(dateDebut && dateFin);
    const totalAchatsAffiche = periodeFiltreeActive
      ? operations.filter(o => o.type === 'Achat').reduce((s, o) => s + (o.montant || 0), 0)
      : this.situation.totalAchats;
    const totalPayeAffiche = periodeFiltreeActive
      ? operations.filter(o => o.type === 'Paiement').reduce((s, o) => s + (o.montant || 0), 0)
      : this.situation.totalPaye;
    const soldeAffiche = periodeFiltreeActive
      ? totalAchatsAffiche - totalPayeAffiche
      : this.situation.solde;

    const totauxSituation = [
      { label: 'Total achats', valeur: this.fmt(totalAchatsAffiche) },
      { label: 'Total payé', valeur: this.fmt(totalPayeAffiche) },
      { label: 'Solde dû', valeur: this.fmt(soldeAffiche) }
    ];

    this.factureService.ouvrirDocumentPDF({
      titre: 'Situation fournisseur',
      sousTitre: `${f.nom} (${f.code || '—'}) — ${this.libellePeriodePdf()}`,
      colonnes: ['Date', 'Type', 'Détail', 'Montant', 'Info'],
      lignes: lignesDetail,
      totaux: totauxSituation,
      pied: [`${this.libellePeriodePdf()}`, ...piedParts.filter(p => p.trim())].join(' | '),
      paysage: true,
      whatsapp: this.whatsAppFournisseur(f, 'Situation fournisseur', totauxSituation)
    });
  }

  // ══════════════════════════════════════════
  // PDF — TOUS FOURNISSEURS (récapitulatif)
  // ══════════════════════════════════════════

  telechargerPdfTousFournisseurs(): void {
    if (!this.fournisseurs.length) {
      Swal.fire({ icon: 'info', title: 'Aucun fournisseur', text: 'La liste est vide.' }); return;
    }

    const lignes = this.fournisseurs.map(f => [
      f.nom,
      f.code || '—',
      f.telephone || '—',
      f.email || '—',
      f.typeProduits || '—',
      this.fmt(f.totalAchats || 0),
      this.fmt(f.solde || 0),
      f.actif ? 'Actif' : 'Inactif'
    ]);

    const totalDette = this.fournisseurs.reduce((s, f) => s + (f.solde || 0), 0);
    const totalAchats = this.fournisseurs.reduce((s, f) => s + (f.totalAchats || 0), 0);

    this.factureService.ouvrirDocumentPDF({
      titre: 'Liste des fournisseurs',
      sousTitre: `${this.fournisseurs.length} fournisseur(s)`,
      colonnes: ['Nom', 'Code', 'Téléphone', 'Email', 'Type produits', 'Total achats', 'Solde dû', 'Statut'],
      lignes,
      totaux: [
        { label: 'Total achats global', valeur: this.fmt(totalAchats) },
        { label: 'Total dettes', valeur: this.fmt(totalDette) }
      ],
      pied: 'Document confidentiel — Ges Boutique'
    });
  }

  // ══════════════════════════════════════════
  // PDF — FICHE FOURNISSEUR COMPLÈTE
  // ══════════════════════════════════════════

  telechargerFicheFournisseur(): void {
    // Ouvre le popup de sélection du fournisseur
    this.ficheFournisseurSelectionne = this.fournisseurs.find(f => f.id === this.filtreFournisseurId) || null;
    this.showFicheModal = true;
  }

  confirmerFicheFournisseur(): void {
    const fournisseur = this.ficheFournisseurSelectionne;
    if (!fournisseur) return;
    this.showFicheModal = false;

    // BUG FIX : ignorait le filtre de période actif (Jour/Semaine/Mois/Personnalisé) et
    // chargeait systématiquement tout l'historique, quel que soit ce qui était sélectionné
    // dans les onglets Achats/Paiements/Situation.
    const { dateDebut, dateFin } = this.periodeActive;
    forkJoin({
      achats: this.productService.getHistoriqueAchats(fournisseur.id!, dateDebut, dateFin),
      paiements: this.productService.getHistoriquePaiements(fournisseur.id!, dateDebut, dateFin)
    }).subscribe({
      next: ({ achats, paiements }) => {
        this.achats = achats;
        this.paiements = paiements;
        this.ouvrirFicheFournisseurPDF(fournisseur);
      },
      error: () => this.ouvrirFicheFournisseurPDF(fournisseur)
    });
  }

  private ouvrirFicheFournisseurPDF(fournisseur: Fournisseur): void {
    const qrTel = encodeURIComponent(fournisseur.telephone || fournisseur.nom);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrTel}`;

    const topRows = this.topProduits.map(p =>
      `<tr><td>${p.nom}</td><td style="text-align:center">${qteDoc(p)}</td><td style="text-align:right;font-weight:700">${this.fmt(p.total)}</td></tr>`
    ).join('') || '<tr><td colspan="3" style="color:#94a3b8;text-align:center">Aucune donnée</td></tr>';

    const achatRows = this.achatsFiltres.map(a => {
      const lignesStr = ((a as any).ligneAchats || (a as any).lignes || [])
        .map((l: any) => `${l.nomProduit || l.produit?.nom || '?'} ×${qteDoc(l)}`).join(', ') || '—';
      return `<tr>
        <td>#${a.id}</td>
        <td>${this.formatDate(a.dateAchat || a.dateCreation)}</td>
        <td style="font-size:0.78rem">${lignesStr}</td>
        <td style="text-align:right;font-weight:700">${this.fmt(a.montantTotal)}</td>
        <td style="text-align:right;color:#16a34a">${this.fmt(a.montantPaye)}</td>
        <td style="text-align:right;color:${a.montantRestant > 0 ? '#dc2626' : '#16a34a'}">${this.fmt(a.montantRestant)}</td>
        <td style="text-align:center"><span style="background:${a.statut === 'PAYE' ? '#dcfce7' : a.statut === 'ANNULE' ? '#fee2e2' : '#fef3c7'};color:${a.statut === 'PAYE' ? '#166534' : a.statut === 'ANNULE' ? '#991b1b' : '#92400e'};padding:2px 8px;border-radius:12px;font-size:0.75rem">${this.statutLabel(a.statut)}</span></td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" style="color:#94a3b8;text-align:center">Aucun achat</td></tr>';

    const paiementRows = this.paiements.map(p =>
      `<tr>
        <td>${this.formatDate(p.datePaiement)}</td>
        <td style="text-align:right;font-weight:700;color:#16a34a">${this.fmt(p.montant)}</td>
        <td>${p.modePaiement || '—'}</td>
        <td>${p.reference || '—'}</td>
        <td>${p.observation || '—'}</td>
      </tr>`
    ).join('') || '<tr><td colspan="5" style="color:#94a3b8;text-align:center">Aucun paiement</td></tr>';

    const totalAch = this.totalAchatsFiltres || fournisseur.totalAchats || 0;
    const totalPay = this.totalPayeFiltres || fournisseur.totalPaye || 0;
    const solde = fournisseur.solde || 0;

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Fiche fournisseur — ${fournisseur.nom}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;padding:24px;font-size:13px;color:#1e293b}
.sheet{background:#fff;max-width:800px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(8,22,72,.12)}
.hdr{background:linear-gradient(135deg,#081648,#1a56db);color:#fff;padding:28px 32px;display:flex;justify-content:space-between;align-items:flex-start}
.hdr-title{font-size:22px;font-weight:900}
.hdr-sub{font-size:12px;opacity:.7;margin-top:4px}
.body{padding:28px 32px}
.section{margin-bottom:24px}
.section-title{font-size:10px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}
.kpi-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.kpi{flex:1;min-width:140px;background:#eff6ff;border-radius:10px;padding:14px 16px;text-align:center}
.kpi.red{background:#fef2f2}
.kpi-val{font-size:1.1rem;font-weight:900;color:#1a56db}
.kpi.red .kpi-val{color:#dc2626}
.kpi-lbl{font-size:0.7rem;color:#64748b;margin-top:3px}
table{width:100%;border-collapse:collapse;font-size:0.8rem;margin-bottom:4px;table-layout:fixed}
th{background:#f8fafc;padding:8px 10px;text-align:left;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0;word-break:break-word;overflow-wrap:anywhere}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#374151;word-break:break-word;overflow-wrap:anywhere;vertical-align:top}
tr:last-child td{border-bottom:none}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.85rem}
.info-row{display:flex;gap:6px;align-items:baseline}
.info-label{color:#94a3b8;font-size:0.75rem;min-width:80px}
.info-val{font-weight:600;color:#1e293b}
.btn-bar{display:flex;gap:8px;justify-content:center;padding:12px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
.btn{border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer}
.btn-p{background:#1a56db;color:#fff}
.btn-c{background:#ef4444;color:#fff}
.ftr{background:linear-gradient(135deg,#081648,#1a56db);color:rgba(255,255,255,.6);text-align:center;padding:14px;font-size:11px}
/* BUG FIX (débordement PDF fiche fournisseur) : table-layout:fixed + word-break empêchent une
   cellule au contenu long (liste de produits d'un achat, observation) de pousser le tableau
   plus large que la page au lieu de passer à la ligne. thead qui se répète + tr/.section qui ne
   se coupent pas évitent qu'une ligne ou une section soit tranchée en deux entre deux pages A4
   (la fiche peut être longue : infos + résumé + top produits + historique achats + paiements). */
@media print{
  .btn-bar{display:none}
  body{background:#fff;padding:0}
  .sheet{box-shadow:none;border-radius:0;max-width:100%}
  thead{display:table-header-group}
  tr{page-break-inside:avoid;break-inside:avoid}
  .section{page-break-inside:avoid;break-inside:avoid}
}
</style></head><body>
<div class="sheet">
  <div class="hdr">
    <div>
      <div class="hdr-title">Fiche Fournisseur</div>
      <div class="hdr-sub">${fournisseur.nom} (${fournisseur.code || '—'}) &middot; ${fournisseur.actif ? 'Actif' : 'Inactif'}</div>
      ${fournisseur.telephone ? `<div class="hdr-sub">Tél: ${fournisseur.telephone}</div>` : ''}
      ${fournisseur.adresse ? `<div class="hdr-sub">${fournisseur.adresse}</div>` : ''}
    </div>
    <img src="${qrUrl}" width="80" height="80" style="border-radius:8px;background:#fff;padding:3px" alt="QR" onerror="this.style.display='none'">
  </div>
  <div class="btn-bar">
    <button class="btn btn-p" onclick="window.print()">Imprimer / PDF</button>
    <button class="btn btn-c" onclick="window.close()">Fermer</button>
  </div>
  <div class="body">

    <div class="section">
      <div class="section-title">Informations</div>
      <div class="info-grid">
        ${fournisseur.email ? `<div class="info-row"><span class="info-label">Email</span><span class="info-val">${fournisseur.email}</span></div>` : ''}
        ${fournisseur.typeProduits ? `<div class="info-row"><span class="info-label">Type produits</span><span class="info-val">${fournisseur.typeProduits}</span></div>` : ''}
        ${fournisseur.conditionsPaiement ? `<div class="info-row"><span class="info-label">Conditions</span><span class="info-val">${fournisseur.conditionsPaiement}</span></div>` : ''}
        ${fournisseur.contactNom ? `<div class="info-row"><span class="info-label">Contact</span><span class="info-val">${fournisseur.contactNom} ${fournisseur.contactTelephone || ''}</span></div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Résumé financier</div>
      <div class="kpi-row">
        <div class="kpi"><div class="kpi-val">${this.fmt(totalAch)}</div><div class="kpi-lbl">Total achats</div></div>
        <div class="kpi"><div class="kpi-val" style="color:#16a34a">${this.fmt(totalPay)}</div><div class="kpi-lbl">Total payé</div></div>
        <div class="kpi ${solde > 0 ? 'red' : ''}"><div class="kpi-val">${this.fmt(solde)}</div><div class="kpi-lbl">Solde dû</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Top 5 produits achetés</div>
      <table>
        <thead><tr><th>Produit</th><th style="text-align:center">Qté totale</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${topRows}</tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Historique des achats</div>
      <table>
        <thead><tr><th>N°</th><th>Date</th><th>Produits</th><th style="text-align:right">Total</th><th style="text-align:right">Payé</th><th style="text-align:right">Restant</th><th style="text-align:center">Statut</th></tr></thead>
        <tbody>${achatRows}</tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Paiements effectués</div>
      <table>
        <thead><tr><th>Date</th><th style="text-align:right">Montant</th><th>Mode</th><th>Référence</th><th>Observation</th></tr></thead>
        <tbody>${paiementRows}</tbody>
      </table>
    </div>

  </div>
  <div class="ftr">Ges Boutique &middot; Fiche générée le ${new Date().toLocaleDateString('fr-FR')}</div>
</div>
</body></html>`;

    this.factureService.ouvrirHtmlPersonnalise(html);
  }

  // ══════════════════════════════════════════
  // REÇU PDF
  // ══════════════════════════════════════════

  imprimerRecuPaiementFournisseur(paiement: any): void {
    const fournisseur = this.fournisseurs.find(f => f.id === this.filtreFournisseurId)
      || this.selectedFournisseur
      || { nom: 'Fournisseur', code: '', telephone: '' };
    this.factureService.ouvrirRecuPaiementFournisseur(paiement, fournisseur);
  }

  // ══════════════════════════════════════════
  // UTILITAIRES
  // ══════════════════════════════════════════

  fmt(m: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(m || 0) + ' FCFA';
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  /** Libellé lisible de la période actuellement filtrée (Achats/Paiements/Situation), affiché sur les PDF téléchargés
   *  pour ne jamais laisser un document sans indication de la période qu'il couvre (ex: "achats du mois"). */
  private libellePeriodePdf(): string {
    switch (this.periodePreset) {
      case 'jour': return `Le ${this.formatDate(this.filtreDateDebut)}`;
      case 'semaine': return `Du ${this.formatDate(this.filtreDateDebut)} au ${this.formatDate(this.filtreDateFin)}`;
      case 'mois': {
        const base = this.filtreDateDebut ? new Date(this.filtreDateDebut) : new Date();
        const nomMois = base.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return `Mois de ${nomMois.charAt(0).toUpperCase()}${nomMois.slice(1)}`;
      }
      case 'personnalise': return `Du ${this.formatDate(this.filtreDateDebut)} au ${this.formatDate(this.filtreDateFin)}`;
      default: return `Tout l'historique`;
    }
  }

  statutLabel(s: string): string {
    return s === 'EN_COURS' ? 'En cours' : s === 'PAYE' ? 'Payé' : 'Annulé';
  }

  statutClass(s: string): string {
    return s === 'PAYE' ? 'badge-success' : s === 'ANNULE' ? 'badge-danger' : 'badge-warning';
  }

  initiale(nom: string): string {
    return (nom || '?')[0].toUpperCase();
  }

  getInitiales(nom: string): string {
    return nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

}
