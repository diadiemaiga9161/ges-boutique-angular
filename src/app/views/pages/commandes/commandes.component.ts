import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService, Commande, CommandeRequest, StatutCommande, LigneCommande } from '../../../shared/services/commande.service';
import { ProductService, Produit } from '../../../shared/services/product.service';
import { ClientService } from '../../../shared/services/client.service';
import { Client, ModePaiement, VenteService } from '../../../shared/services/vente.service';
import { AuthService } from '../../../shared/services/auth.service';
import Swal from 'sweetalert2';

interface LigneForm {
  produitId: number;
  produitNom: string;
  prixOriginal: number;
  prixUnitaire: number;
  quantite: number;
}

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commandes.component.html',
  styleUrl: './commandes.component.scss'
})
export class CommandesComponent implements OnInit {

  ModePaiementEnum = ModePaiement;

  commandes: Commande[] = [];
  commandesFiltrees: Commande[] = [];
  produits: Produit[] = [];
  clients: Client[] = [];
  clientsFiltres: Client[] = [];
  isLoading = false;

  // Filtres
  searchTerm = '';
  statutFilter: '' | 'BROUILLON' | 'VALIDEE' | 'CREDIT' | 'ANNULEE' = '';

  // Modal formulaire (créer / modifier)
  showModal = false;
  editingId: number | null = null;
  lignesForm: LigneForm[] = [];
  searchProduit = '';
  produitsFiltres: Produit[] = [];
  showProduitDropdown = false;
  searchClient = '';
  showClientDropdown = false;

  form = {
    clientId: null as number | null,
    clientNom: '',
    clientPrenom: '',
    clientTelephone: '',
    modePaiement: 'ESPECES',
    referencePaiement: '',
    estCredit: false,
    montantVerse: 0,
    dateEcheance: '',
    notes: ''
  };

  StatutCommande = StatutCommande;
  isSubmitting = false;

  // Modal règlement individuel
  showReglementModal = false;
  commandeSelectionnee: Commande | null = null;
  montantReglement = 0;

  // Modal règlement groupé
  showReglementGroupeModal = false;
  commandesCredit: Commande[] = [];
  idsSelectionnes: number[] = [];
  montantReglementGroupe = 0;

  constructor(
    private commandeService: CommandeService,
    private productService: ProductService,
    private clientService: ClientService,
    private auth: AuthService,
    private venteService: VenteService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.productService.getProducts().subscribe(p => {
      this.produits = p.filter(x => x.quantite > 0);
    });
    this.clientService.getAll().subscribe((c: any) => {
      this.clients = c.content || c || [];
    });
  }

  charger(): void {
    this.isLoading = true;
    this.commandeService.getAll().subscribe({
      next: data => {
        this.commandes = data;
        this.appliquerFiltres();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  appliquerFiltres(): void {
    let liste = [...this.commandes];
    if (this.statutFilter === 'CREDIT') {
      liste = liste.filter(c => c.estCredit && c.montantRestant > 0);
    } else if (this.statutFilter === 'ANNULEE') {
      liste = liste.filter((c: any) => c.statut === 'ANNULEE');
    } else if (this.statutFilter) {
      liste = liste.filter(c => c.statut === this.statutFilter);
    }
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      liste = liste.filter(c =>
        c.numeroCommande?.toLowerCase().includes(t) ||
        (c.clientNom || '').toLowerCase().includes(t) ||
        (c.clientPrenom || '').toLowerCase().includes(t) ||
        (c.notes || '').toLowerCase().includes(t)
      );
    }
    this.commandesFiltrees = liste;
  }

  // ─── Produit search ────────────────────────────────────────────────────────

  filtrerProduits(): void {
    const t = this.searchProduit.toLowerCase().trim();
    this.produitsFiltres = t
      ? this.produits.filter(p => p.nom.toLowerCase().includes(t)).slice(0, 10)
      : this.produits.slice(0, 10);
    this.showProduitDropdown = true;
  }

  selectionnerProduit(p: Produit): void {
    const existing = this.lignesForm.find(l => l.produitId === p.id);
    if (existing) {
      existing.quantite++;
    } else {
      this.lignesForm.push({ produitId: p.id, produitNom: p.nom, prixOriginal: p.prixVente, prixUnitaire: p.prixVente, quantite: 1 });
    }
    this.searchProduit = '';
    this.showProduitDropdown = false;
  }

  supprimerLigne(i: number): void {
    this.lignesForm.splice(i, 1);
  }

  // ─── Client search ─────────────────────────────────────────────────────────

  filtrerClients(): void {
    const t = this.searchClient.toLowerCase().trim();
    this.clientsFiltres = t
      ? this.clients.filter((c: any) => `${c.nom} ${c.prenom} ${c.numeroTelephone}`.toLowerCase().includes(t)).slice(0, 8)
      : this.clients.slice(0, 8);
    this.showClientDropdown = true;
  }

  selectionnerClient(c: any): void {
    this.form.clientId = c.id;
    this.form.clientNom = c.nom;
    this.form.clientPrenom = c.prenom || '';
    this.form.clientTelephone = c.numeroTelephone || '';
    this.searchClient = `${c.nom} ${c.prenom || ''}`.trim();
    this.showClientDropdown = false;
  }

  effacerClient(): void {
    this.form.clientId = null;
    this.form.clientNom = '';
    this.form.clientPrenom = '';
    this.form.clientTelephone = '';
    this.searchClient = '';
  }

  // ─── Calculs ───────────────────────────────────────────────────────────────

  get totalCommande(): number {
    return this.lignesForm.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);
  }

  get resteAPayer(): number {
    return Math.max(0, this.totalCommande - (this.form.montantVerse || 0));
  }

  // ─── Modal CRUD ────────────────────────────────────────────────────────────

  ouvrirCreer(): void {
    this.editingId = null;
    this.lignesForm = [];
    this.form = { clientId: null, clientNom: '', clientPrenom: '', clientTelephone: '', modePaiement: 'ESPECES', referencePaiement: '', estCredit: false, montantVerse: 0, dateEcheance: '', notes: '' };
    this.searchClient = '';
    this.searchProduit = '';
    this.showModal = true;
  }

  ouvrirModifier(commande: Commande): void {
    this.editingId = commande.id;
    this.form = {
      clientId: commande.client?.id || null,
      clientNom: commande.clientNom || '',
      clientPrenom: commande.clientPrenom || '',
      clientTelephone: commande.clientTelephone || '',
      modePaiement: commande.modePaiement || 'ESPECES',
      referencePaiement: commande.referencePaiement || '',
      estCredit: commande.estCredit || false,
      montantVerse: commande.montantVerse || 0,
      dateEcheance: commande.dateEcheance ? commande.dateEcheance.split('T')[0] : '',
      notes: commande.notes || ''
    };
    this.searchClient = [commande.clientNom, commande.clientPrenom].filter(Boolean).join(' ');
    this.lignesForm = (commande.lignes || []).map(l => ({
      produitId: l.produit?.id || l.produitId || 0,
      produitNom: l.produit?.nom || l.produitNom || '',
      prixOriginal: l.produit?.prixVente || l.prixUnitaire,
      prixUnitaire: l.prixUnitaire,
      quantite: l.quantite
    }));
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  getModePaiementOptions(): ModePaiement[] {
    return this.venteService.getModePaiementOptions();
  }

  getModePaiementLabel(mode: string): string {
    return this.venteService.getModePaiementLabel(mode);
  }

  getModePaiementPlaceholder(): string {
    switch (this.form.modePaiement) {
      case ModePaiement.ORANGE_MONEY:
      case ModePaiement.MOOV_MONEY:
      case ModePaiement.WAVE_MONEY:
        return 'Numéro de transaction';
      case ModePaiement.CARTE_BANCAIRE:
        return 'Référence carte bancaire';
      case ModePaiement.VIREMENT:
        return 'Référence virement';
      default:
        return 'Référence paiement';
    }
  }

  enregistrer(): void {
    if (this.lignesForm.length === 0) {
      Swal.fire('Erreur', 'Ajoutez au moins un produit', 'error');
      return;
    }
    if (!this.form.modePaiement) {
      Swal.fire('Erreur', 'Choisissez un mode de paiement', 'error');
      return;
    }
    if (this.form.modePaiement !== ModePaiement.ESPECES && !this.form.referencePaiement?.trim()) {
      Swal.fire('Erreur', `Référence requise pour ${this.getModePaiementLabel(this.form.modePaiement)}`, 'error');
      return;
    }

    const request: CommandeRequest = {
      vendeurId: this.auth.getUserId(),
      clientId: this.form.clientId || undefined,
      clientNom: this.form.clientNom || undefined,
      clientPrenom: this.form.clientPrenom || undefined,
      clientTelephone: this.form.clientTelephone || undefined,
      lignes: this.lignesForm.map(l => ({ produitId: l.produitId, quantite: l.quantite, prixUnitaire: l.prixUnitaire })),
      modePaiement: this.form.modePaiement,
      referencePaiement: this.form.referencePaiement || undefined,
      estCredit: this.form.estCredit,
      montantVerse: this.form.estCredit ? this.form.montantVerse : undefined,
      dateEcheance: this.form.estCredit && this.form.dateEcheance ? this.form.dateEcheance : undefined,
      notes: this.form.notes || undefined
    };

    this.isSubmitting = true;
    const obs = this.editingId
      ? this.commandeService.modifier(this.editingId, request)
      : this.commandeService.creer(request);

    obs.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.fermerModal();
        this.charger();
        Swal.fire({ icon: 'success', title: this.editingId ? 'Commande modifiée' : 'Commande créée', timer: 1500, showConfirmButton: false });
      },
      error: (e: any) => {
        this.isSubmitting = false;
        Swal.fire('Erreur', e.error?.message || 'Erreur lors de l\'enregistrement', 'error');
      }
    });
  }

  // ─── Valider ───────────────────────────────────────────────────────────────

  valider(commande: Commande): void {
    Swal.fire({
      title: 'Valider la commande ?',
      html: `<p>La commande <strong>${commande.numeroCommande}</strong> sera convertie en vente.<br>Le stock sera décrémenté.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#16a34a'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.commandeService.valider(commande.id).subscribe({
        next: () => {
          this.charger();
          Swal.fire({ icon: 'success', title: 'Commande validée !', text: 'La vente a été créée et le stock mis à jour.', timer: 2000, showConfirmButton: false });
        },
        error: (e: any) => Swal.fire('Erreur', e.error?.message || 'Erreur validation', 'error')
      });
    });
  }

  // ─── Supprimer ─────────────────────────────────────────────────────────────

  supprimer(commande: Commande): void {
    Swal.fire({
      title: 'Supprimer ?',
      text: `Supprimer la commande ${commande.numeroCommande} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.commandeService.supprimer(commande.id).subscribe({
        next: () => {
          this.charger();
          Swal.fire({ icon: 'success', title: 'Supprimée', timer: 1200, showConfirmButton: false });
        },
        error: (e: any) => Swal.fire('Erreur', e.error?.message || 'Impossible de supprimer', 'error')
      });
    });
  }

  // ─── Facture ───────────────────────────────────────────────────────────────

  showFactureCommandeModal = false;
  commandeForFacture: Commande | null = null;
  factureCommandeChauffeur = '';

  imprimerFacture(commande: Commande): void {
    this.commandeForFacture = commande;
    this.factureCommandeChauffeur = '';
    this.showFactureCommandeModal = true;
  }

  confirmerGenerationFactureCommande(): void {
    if (!this.commandeForFacture) return;
    const commandeAvecChauffeur = { ...this.commandeForFacture, chauffeur: this.factureCommandeChauffeur || undefined };
    this.commandeService.imprimerFactureCommande(commandeAvecChauffeur);
    this.showFactureCommandeModal = false;
    this.commandeForFacture = null;
  }

  // ─── Annuler ──────────────────────────────────────────────────────────────

  annuler(commande: Commande): void {
    const isValidee = commande.statut === StatutCommande.VALIDEE;
    Swal.fire({
      title: 'Annuler la commande ?',
      html: `<p><strong>${commande.numeroCommande}</strong></p>${isValidee ? '<p class="text-warning">Cette commande est validée — la vente liée sera annulée et le stock restauré.</p>' : ''}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non',
      confirmButtonColor: '#dc2626'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.commandeService.annuler(commande.id, this.auth.getUserId()).subscribe({
        next: () => {
          this.statutFilter = '';
          this.charger();
          Swal.fire({ icon: 'success', title: 'Commande annulée', text: `${commande.numeroCommande} est maintenant annulée`, timer: 2000, showConfirmButton: false });
        },
        error: (e: any) => Swal.fire('Erreur', e.error?.message || 'Erreur lors de l\'annulation', 'error')
      });
    });
  }

  // ─── Règlement individuel ─────────────────────────────────────────────────

  ouvrirReglementIndividuel(c: Commande): void {
    this.commandeSelectionnee = c;
    this.montantReglement = 0;
    this.showReglementModal = true;
  }

  fermerReglementModal(): void {
    this.showReglementModal = false;
    this.commandeSelectionnee = null;
    this.montantReglement = 0;
  }

  confirmerReglementIndividuel(): void {
    if (!this.commandeSelectionnee || !this.montantReglement) return;
    this.commandeService.payerCredit(this.commandeSelectionnee.id, this.montantReglement).subscribe({
      next: () => {
        this.fermerReglementModal();
        this.charger();
        Swal.fire({ icon: 'success', title: 'Paiement enregistré', timer: 1500, showConfirmButton: false });
      },
      error: (e: any) => Swal.fire('Erreur', e.error?.message || 'Erreur lors du règlement', 'error')
    });
  }

  // ─── Règlement groupé ─────────────────────────────────────────────────────

  ouvrirReglementGroupe(): void {
    this.commandesCredit = this.commandes.filter(c => c.estCredit && c.montantRestant > 0);
    this.idsSelectionnes = this.commandesCredit.map(c => c.id);
    this.montantReglementGroupe = this.totalCreditsRestants;
    this.showReglementGroupeModal = true;
  }

  fermerReglementGroupeModal(): void {
    this.showReglementGroupeModal = false;
    this.idsSelectionnes = [];
    this.montantReglementGroupe = 0;
  }

  toggleSelectionCredit(id: number): void {
    const idx = this.idsSelectionnes.indexOf(id);
    idx === -1 ? this.idsSelectionnes.push(id) : this.idsSelectionnes.splice(idx, 1);
  }

  selectionnerTousCredits(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.idsSelectionnes = checked ? this.commandesCredit.map(c => c.id) : [];
  }

  get totalCreditsSelectionnes(): number {
    return this.commandesCredit
      .filter(c => this.idsSelectionnes.includes(c.id))
      .reduce((s, c) => s + (c.montantRestant || 0), 0);
  }

  confirmerReglementGroupe(): void {
    if (!this.idsSelectionnes.length || !this.montantReglementGroupe) return;
    this.commandeService.payerCreditsGroupes(this.idsSelectionnes, this.montantReglementGroupe).subscribe({
      next: () => {
        this.fermerReglementGroupeModal();
        this.charger();
        Swal.fire({ icon: 'success', title: 'Règlement groupé enregistré', timer: 1500, showConfirmButton: false });
      },
      error: (e: any) => Swal.fire('Erreur', e.error?.message || 'Erreur règlement groupé', 'error')
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  formatMontant(v: number): string { return this.commandeService.formatMontant(v); }
  formatDate(d: string): string { return this.commandeService.formatDate(d); }

  getClientNom(c: Commande): string {
    return [c.clientNom, c.clientPrenom].filter(Boolean).join(' ') || c.client?.nom || 'N/A';
  }

  get nbBrouillons(): number { return this.commandes.filter(c => c.statut === StatutCommande.BROUILLON).length; }
  get nbValidees(): number { return this.commandes.filter(c => c.statut === StatutCommande.VALIDEE).length; }
  get totalValidees(): number { return this.commandes.filter(c => c.statut === StatutCommande.VALIDEE).reduce((s, c) => s + (c.montantTotal || 0), 0); }
  get nbCreditsEnCours(): number { return this.commandes.filter(c => c.estCredit && c.montantRestant > 0).length; }
  get totalCreditsRestants(): number { return this.commandes.filter(c => c.estCredit && c.montantRestant > 0).reduce((s, c) => s + (c.montantRestant || 0), 0); }
}
