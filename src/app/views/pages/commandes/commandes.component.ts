import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService, Commande, CommandeRequest, StatutCommande, LigneCommande } from '../../../shared/services/commande.service';
import { ProductService, Produit } from '../../../shared/services/product.service';
import { ClientService } from '../../../shared/services/client.service';
import { Client } from '../../../shared/services/vente.service';
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

  commandes: Commande[] = [];
  commandesFiltrees: Commande[] = [];
  produits: Produit[] = [];
  clients: Client[] = [];
  clientsFiltres: Client[] = [];
  isLoading = false;

  // Filtres
  searchTerm = '';
  statutFilter: '' | 'BROUILLON' | 'VALIDEE' = '';

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

  constructor(
    private commandeService: CommandeService,
    private productService: ProductService,
    private clientService: ClientService,
    private auth: AuthService
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
    if (this.statutFilter) {
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

  enregistrer(): void {
    if (this.lignesForm.length === 0) {
      Swal.fire('Erreur', 'Ajoutez au moins un produit', 'error');
      return;
    }
    if (!this.form.modePaiement) {
      Swal.fire('Erreur', 'Choisissez un mode de paiement', 'error');
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

  imprimerFacture(commande: Commande): void {
    this.commandeService.imprimerFactureCommande(commande);
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
}
