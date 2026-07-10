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
  ProduitSimple
} from '../../../shared/services/product.service';
import { AuthService } from '../../../shared/services/auth.service';
import { FactureService } from '../../../shared/services/facture.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.scss']
})
export class FournisseursComponent implements OnInit {

  // ─── Navigation ────────────────────────────────────
  ongletActif: 'liste' | 'achats' | 'paiements' | 'situation' = 'liste';

  // ─── Données ───────────────────────────────────────
  fournisseurs: Fournisseur[] = [];
  achats: AchatFournisseur[] = [];
  paiements: PaiementFournisseur[] = [];
  avances: AvanceFournisseur[] = [];
  produits: ProduitSimple[] = [];
  situation: FournisseurCompteDto | null = null;

  // ─── Filtres ───────────────────────────────────────
  searchFournisseur = '';
  filtreFournisseurId = 0;
  filtreStatutAchat = '';

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

  // ─── Formulaires ───────────────────────────────────
  fournisseurForm: FournisseurRequest = {
    nom: '', code: '', adresse: '', telephone: '', email: '',
    siteWeb: '', contactNom: '', contactTelephone: '', contactEmail: '',
    description: '', typeProduits: '', conditionsPaiement: '',
    delaiLivraison: undefined, note: undefined, actif: true
  };

  achatForm: AchatFournisseurRequest = {
    fournisseurId: 0,
    lignes: [{ produitId: 0, quantite: 1, prixAchatUnitaire: 0, prixVente: 0 }],
    montantPaye: 0,
    commentaire: ''
  };

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
    return this.achatsFiltres.reduce((s, a) => s + (a.montantPaye || 0), 0);
  }

  get totalRestantFiltres(): number {
    return this.achatsFiltres.reduce((s, a) => s + (a.montantRestant || 0), 0);
  }

  get totalDetteFournisseurs(): number {
    return this.fournisseurs.reduce((s, f) => s + (f.solde || 0), 0);
  }

  get fournisseursSolde(): Fournisseur[] {
    return this.fournisseurs.filter(f => (f.solde || 0) > 0).sort((a, b) => (b.solde || 0) - (a.solde || 0));
  }

  get totalAchatsGlobal(): number {
    return this.fournisseurs.reduce((s, f) => s + (f.totalAchats || 0), 0);
  }

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private http: HttpClient,
    private factureService: FactureService
  ) {}

  ngOnInit(): void {
    this.chargerFournisseurs();
    this.chargerProduits();
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

  chargerAchats(): void {
    if (!this.filtreFournisseurId) {
      Swal.fire({ icon: 'info', title: 'Sélectionnez un fournisseur', text: 'Choisissez un fournisseur pour voir ses achats.', timer: 2000, showConfirmButton: false });
      return;
    }
    this.isLoading = true;
    this.productService.getHistoriqueAchats(this.filtreFournisseurId).subscribe({
      next: data => { this.achats = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  chargerPaiements(): void {
    if (!this.filtreFournisseurId) return;
    this.productService.getHistoriquePaiements(this.filtreFournisseurId).subscribe({
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
    this.productService.getSituationFournisseur(this.filtreFournisseurId).subscribe({
      next: data => { this.situation = data; this.isLoadingSituation = false; },
      error: () => { this.isLoadingSituation = false; }
    });
  }

  chargerProduits(): void {
    this.productService.getProduitsSimples().subscribe({
      next: data => this.produits = data,
      error: () => {}
    });
  }

  changerOnglet(onglet: 'liste' | 'achats' | 'paiements' | 'situation'): void {
    this.ongletActif = onglet;
    if (onglet === 'achats' && this.filtreFournisseurId) this.chargerAchats();
    if (onglet === 'paiements' && this.filtreFournisseurId) this.chargerPaiements();
    if (onglet === 'situation' && this.filtreFournisseurId) this.chargerSituation();
  }

  onFournisseurChange(): void {
    this.achats = [];
    this.paiements = [];
    this.avances = [];
    this.situation = null;
    if (this.ongletActif === 'achats') this.chargerAchats();
    if (this.ongletActif === 'paiements') this.chargerPaiements();
    if (this.ongletActif === 'situation') this.chargerSituation();
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
      lignes: [{ produitId: 0, quantite: 1, prixAchatUnitaire: 0, prixVente: 0 }],
      montantPaye: 0, commentaire: ''
    };
    this.showAchatModal = true;
  }

  ajouterLigne(): void {
    this.achatForm.lignes.push({ produitId: 0, quantite: 1, prixAchatUnitaire: 0, prixVente: 0 });
  }

  retirerLigne(i: number): void {
    if (this.achatForm.lignes.length > 1) this.achatForm.lignes.splice(i, 1);
  }

  get montantTotalAchat(): number {
    return this.achatForm.lignes.reduce((s, l) => s + ((l.quantite || 0) * (l.prixAchatUnitaire || 0)), 0);
  }

  enregistrerAchat(): void {
    if (!this.achatForm.fournisseurId) {
      Swal.fire({ icon: 'warning', title: 'Fournisseur requis', text: 'Sélectionnez un fournisseur.' }); return;
    }
    if (this.achatForm.lignes.some(l => !l.produitId || !l.quantite || !l.prixAchatUnitaire)) {
      Swal.fire({ icon: 'warning', title: 'Lignes incomplètes', text: 'Renseignez produit, quantité et prix pour chaque ligne.' }); return;
    }
    this.isSaving = true;
    this.productService.creerAchat({ ...this.achatForm, utilisateurId: this.authService.getUserId() || undefined }).subscribe({
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
    this.isSaving = true;
    this.productService.payerFournisseur({ ...this.paiementForm, utilisateurId: this.authService.getUserId() || undefined }).subscribe({
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
      (a.lignes || []).map((l: any) => `${l.produit?.nom || '?'} ×${l.quantite}`).join(', ') || '—',
      this.fmt(a.montantTotal),
      this.fmt(a.montantPaye),
      this.fmt(a.montantRestant),
      this.statutLabel(a.statut),
      a.commentaire || '—'
    ]);

    this.factureService.ouvrirDocumentPDF({
      titre: 'Achats fournisseur',
      sousTitre: `${fournisseur.nom} (${fournisseur.code || '—'})`,
      colonnes: ['N°', 'Date', 'Produits', 'Total', 'Payé', 'Restant', 'Statut', 'Commentaire'],
      lignes,
      totaux: [
        { label: 'Total achats', valeur: this.fmt(this.totalAchatsFiltres) },
        { label: 'Total payé', valeur: this.fmt(this.totalPayeFiltres) },
        { label: 'Reste à payer', valeur: this.fmt(this.totalRestantFiltres) }
      ],
      pied: `${this.achatsFiltres.length} achat(s) — Document confidentiel`
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

    // Résumé financier
    const lignesResume: any[][] = [
      ['Total achats', this.fmt(this.situation.totalAchats)],
      ['Total payé', this.fmt(this.situation.totalPaye)],
      ['Solde dû (reste à payer)', this.fmt(this.situation.solde)]
    ];

    // On utilise le résumé financier comme document principal
    const piedParts: string[] = [
      `${f.telephone ? 'Tél : ' + f.telephone + ' — ' : ''}${f.email ? 'Email : ' + f.email : ''}`,
      `Adresse : ${f.adresse || '—'} | Type produits : ${f.typeProduits || '—'} | Statut : ${f.actif ? 'Actif' : 'Inactif'}`
    ];

    this.factureService.ouvrirDocumentPDF({
      titre: 'Situation fournisseur',
      sousTitre: `${f.nom} (${f.code || '—'})`,
      colonnes: ['Indicateur', 'Montant'],
      lignes: lignesResume,
      totaux: [],
      pied: piedParts.filter(p => p.trim()).join(' | ')
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

    forkJoin({
      achats: this.productService.getHistoriqueAchats(fournisseur.id!),
      paiements: this.productService.getHistoriquePaiements(fournisseur.id!)
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
      `<tr><td>${p.nom}</td><td style="text-align:center">${p.quantite}</td><td style="text-align:right;font-weight:700">${this.fmt(p.total)}</td></tr>`
    ).join('') || '<tr><td colspan="3" style="color:#94a3b8;text-align:center">Aucune donnée</td></tr>';

    const achatRows = this.achatsFiltres.map(a => {
      const lignesStr = ((a as any).ligneAchats || (a as any).lignes || [])
        .map((l: any) => `${l.nomProduit || l.produit?.nom || '?'} ×${l.quantite}`).join(', ') || '—';
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
table{width:100%;border-collapse:collapse;font-size:0.8rem;margin-bottom:4px}
th{background:#f8fafc;padding:8px 10px;text-align:left;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#374151}
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
@media print{.btn-bar{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0;max-width:100%}}
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
    return new Intl.NumberFormat('fr-FR').format(m || 0) + ' FCFA';
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
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
