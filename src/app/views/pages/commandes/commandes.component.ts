import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService, Commande, CommandeRequest, StatutCommande, LigneCommande } from '../../../shared/services/commande.service';
import { ProductService, Produit } from '../../../shared/services/product.service';
import { ClientService } from '../../../shared/services/client.service';
import { Client, ModePaiement, VenteService } from '../../../shared/services/vente.service';
import { AuthService } from '../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { MontantInputDirective } from '../../../shared/directives/montant-input.directive';
import { COUNTRY_CODES, construireNumeroComplet, validatePhoneForCountry } from '../../../shared/utils/telephone.util';
import { envoyerWhatsAppDirect } from '../../../shared/utils/whatsapp.util';

interface LigneForm {
  produitId: number;
  produitNom: string;
  prixOriginal: number;
  prixUnitaire: number;
  quantite: number;
}

import { MesurePuPipe, MesureQtePipe, MesureSuffixePipe } from '../../../shared/pipes/mesure.pipe';

import { ActionPermission, RoleService } from '../../../shared/services/role.service';
@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, MontantInputDirective, MesureQtePipe, MesurePuPipe, MesureSuffixePipe],
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
    private roleService: RoleService,
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
    if (commande.origine === 'VITRINE') {
      this.validerCommandeVitrine(commande);
      return;
    }
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

  // ─── Valider (commandes VITRINE) — saisie livraison + notifications WhatsApp ──

  /** Étape 1 (VITRINE uniquement) : saisie optionnelle des infos de livraison avant la
   *  confirmation habituelle. On peut valider sans rien remplir — pas de livraison. */
  private validerCommandeVitrine(commande: Commande): void {
    const optionsIndicatifs = COUNTRY_CODES
      .map(c => `<option value="${c.code}" ${c.code === '+223' ? 'selected' : ''}>${c.flag} ${c.code}</option>`)
      .join('');

    Swal.fire({
      title: 'Infos de livraison (optionnel)',
      html: `
        <div style="text-align:left">
          <p>Commande <strong>${commande.numeroCommande}</strong> — à remplir uniquement si une livraison est prévue.</p>
          <label style="display:block;margin:10px 0 4px;font-weight:600">Frais de livraison (FCFA)</label>
          <input id="swal-frais-livraison" type="number" min="0" class="swal2-input" style="margin:0" placeholder="Ex : 1000">
          <label style="display:block;margin:10px 0 4px;font-weight:600">Nom du chauffeur</label>
          <input id="swal-chauffeur-nom" type="text" class="swal2-input" style="margin:0" placeholder="Ex : Moussa">
          <label style="display:block;margin:10px 0 4px;font-weight:600">Téléphone du chauffeur</label>
          <div style="display:flex;gap:6px">
            <select id="swal-chauffeur-indicatif" class="swal2-select" style="margin:0;max-width:110px">${optionsIndicatifs}</select>
            <input id="swal-chauffeur-telephone" type="tel" class="swal2-input" style="margin:0;flex:1" placeholder="Numéro sans l'indicatif">
          </div>
          <div id="swal-chauffeur-erreur" style="color:#dc2626;font-size:0.82rem;margin-top:6px"></div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Continuer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#16a34a',
      focusConfirm: false,
      preConfirm: () => {
        const fraisStr = (document.getElementById('swal-frais-livraison') as HTMLInputElement)?.value?.trim();
        const chauffeurNom = (document.getElementById('swal-chauffeur-nom') as HTMLInputElement)?.value?.trim();
        const indicatif = (document.getElementById('swal-chauffeur-indicatif') as HTMLSelectElement)?.value || '+223';
        const telLocal = (document.getElementById('swal-chauffeur-telephone') as HTMLInputElement)?.value?.trim();

        if (telLocal && !validatePhoneForCountry(telLocal, indicatif)) {
          Swal.showValidationMessage(`Numéro de chauffeur invalide pour l'indicatif ${indicatif}`);
          return false;
        }

        return {
          fraisLivraison: fraisStr ? Number(fraisStr) : undefined,
          chauffeurNom: chauffeurNom || undefined,
          chauffeurTelephone: telLocal ? construireNumeroComplet(indicatif, telLocal) : undefined
        };
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      this.confirmerValidationVitrine(commande, result.value || {});
    });
  }

  /** Étape 2 (VITRINE) : confirmation habituelle, puis appel de validation avec les infos de livraison. */
  private confirmerValidationVitrine(
    commande: Commande,
    infosLivraison: { fraisLivraison?: number; chauffeurNom?: string; chauffeurTelephone?: string }
  ): void {
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
      this.commandeService.valider(commande.id, infosLivraison).subscribe({
        next: (rep: any) => {
          this.charger();
          const commandeMaj: Commande = rep?.commande || { ...commande, ...infosLivraison };
          this.afficherSuccesValidationVitrine(commandeMaj);
        },
        error: (e: any) => Swal.fire('Erreur', e.error?.message || 'Erreur validation', 'error')
      });
    });
  }

  /** Étape 3 (VITRINE) : succès + boutons WhatsApp (client toujours, chauffeur si renseigné). */
  private afficherSuccesValidationVitrine(commande: Commande): void {
    const totalProduits = commande.montantTotal || 0;
    const frais = commande.fraisLivraison || 0;
    const totalAPreparer = totalProduits + frais;

    const messageClient = [
      `Bonjour ${commande.clientNom || ''},`.trim(),
      `Votre commande N°${commande.numeroCommande} a été validée.`,
      `Total produits : ${this.formatMontant(totalProduits)}`,
      frais ? `Frais de livraison : ${this.formatMontant(frais)}` : null,
      `TOTAL à préparer : ${this.formatMontant(totalAPreparer)}`,
      `Paiement à la livraison. Merci de votre confiance !`
    ].filter(Boolean).join('\n');

    const messageChauffeur = [
      `Livraison à effectuer — commande N°${commande.numeroCommande}`,
      `Client : ${this.getClientNom(commande)}`,
      `Téléphone client : ${commande.clientTelephone || 'N/A'}`,
      `Adresse : ${commande.adresseLivraison || 'non renseignée'}`,
      `Montant total à collecter : ${this.formatMontant(totalAPreparer)}`
    ].join('\n');

    const boutons: string[] = [
      `<button id="wa-client-btn" class="swal2-styled" style="background:#25D366;color:#fff;margin:4px;border:none">💬 WhatsApp au client</button>`
    ];
    if (commande.chauffeurTelephone) {
      boutons.push(`<button id="wa-chauffeur-btn" class="swal2-styled" style="background:#128C7E;color:#fff;margin:4px;border:none">💬 WhatsApp au chauffeur</button>`);
    }

    Swal.fire({
      icon: 'success',
      title: 'Commande validée !',
      html: `
        <p>La vente a été créée et le stock mis à jour.</p>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">${boutons.join('')}</div>
      `,
      confirmButtonText: 'Fermer',
      didOpen: () => {
        document.getElementById('wa-client-btn')?.addEventListener('click', () => {
          envoyerWhatsAppDirect(commande.clientTelephone, messageClient);
        });
        document.getElementById('wa-chauffeur-btn')?.addEventListener('click', () => {
          envoyerWhatsAppDirect(commande.chauffeurTelephone, messageChauffeur);
        });
      }
    });
  }

  // ─── Livraison : Prête → Livrée (commande confirmée) + message WhatsApp au client ──

  libelleStatut(c: Commande): string {
    if (c.statut === StatutCommande.VALIDEE) {
      if (c.etapeLivraison === 'LIVREE') return 'Livrée';
      if (c.etapeLivraison === 'PRETE') return 'Prête';
      return 'Validée';
    }
    return c.statut === StatutCommande.ANNULEE ? 'Annulée' : 'Brouillon';
  }

  marquerEtape(c: Commande, etape: 'PRETE' | 'LIVREE'): void {
    this.commandeService.changerEtapeLivraison(c.id!, etape).subscribe({
      next: () => {
        c.etapeLivraison = etape;
        const nom = (c.clientPrenom || c.clientNom || '').trim();
        const message = etape === 'PRETE'
          ? [`Bonjour ${nom},`.replace(' ,', ','), `Votre commande N°${c.numeroCommande} est prête.`, `Merci de votre confiance !`].join('\n')
          : [`Bonjour ${nom},`.replace(' ,', ','), `Votre commande N°${c.numeroCommande} a été livrée.`, `Merci et à bientôt !`].join('\n');
        Swal.fire({
          icon: 'success',
          title: etape === 'PRETE' ? 'Commande prête' : 'Commande livrée',
          html: c.clientTelephone
            ? `<p>Prévenir le client ?</p><button id="wa-etape-btn" class="swal2-styled" style="background:#25D366;color:#fff;border:none">💬 WhatsApp au client</button>`
            : '<p>Aucun numéro de téléphone pour ce client.</p>',
          confirmButtonText: 'Fermer',
          didOpen: () => document.getElementById('wa-etape-btn')
            ?.addEventListener('click', () => envoyerWhatsAppDirect(c.clientTelephone, message))
        });
      },
      error: (e) => Swal.fire('Erreur', e?.error?.message || "Impossible de changer l'étape de la commande", 'error')
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
    if (this.montantReglement > this.commandeSelectionnee.montantRestant) {
      Swal.fire('Erreur', `Le montant ne peut pas dépasser ${this.formatMontant(this.commandeSelectionnee.montantRestant)}`, 'error');
      return;
    }
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
    if (this.montantReglementGroupe > this.totalCreditsSelectionnes) {
      Swal.fire('Erreur', `Le montant ne peut pas dépasser ${this.formatMontant(this.totalCreditsSelectionnes)}`, 'error');
      return;
    }
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

  /** Bouton visible seulement si le rôle de la personne permet l'action (rôles personnalisés). */
  peut(module: string, action: ActionPermission): boolean {
    return this.roleService.peut(module, action);
  }
}
