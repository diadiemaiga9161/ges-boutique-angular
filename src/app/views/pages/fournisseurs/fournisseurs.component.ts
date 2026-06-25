import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  // ─── Modals ────────────────────────────────────────
  showFormModal = false;
  showAchatModal = false;
  showPaiementModal = false;
  showAvanceModal = false;
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
    let liste = this.achats;
    if (this.filtreFournisseurId) liste = liste.filter(a => a.fournisseur?.id === this.filtreFournisseurId);
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
    private authService: AuthService
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
  // PDF — ACHATS FOURNISSEUR
  // ══════════════════════════════════════════

  telechargerPdfAchats(): void {
    const fournisseur = this.fournisseurs.find(f => f.id === this.filtreFournisseurId);
    if (!fournisseur || !this.achatsFiltres.length) {
      Swal.fire({ icon: 'info', title: 'Aucune donnée', text: 'Sélectionnez un fournisseur et chargez ses achats.' }); return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date();

    // En-tête bleu
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LISTE DES ACHATS FOURNISSEUR', pageW / 2, 13, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fournisseur : ${fournisseur.nom} (${fournisseur.code || '—'})`, pageW / 2, 21, { align: 'center' });
    doc.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, pageW / 2, 27, { align: 'center' });

    doc.setTextColor(0, 0, 0);

    // Résumé stats
    autoTable(doc, {
      startY: 38,
      head: [['Total achats', 'Total payé', 'Reste à payer', 'Nombre achats']],
      body: [[
        this.fmt(this.totalAchatsFiltres),
        this.fmt(this.totalPayeFiltres),
        this.fmt(this.totalRestantFiltres),
        String(this.achatsFiltres.length)
      ]],
      styles: { fontSize: 11, fontStyle: 'bold', halign: 'center' },
      headStyles: { fillColor: [30, 64, 175], fontSize: 10 },
      bodyStyles: { fillColor: [239, 246, 255] },
      margin: { left: 14, right: 14 }
    });

    let y = (doc as any).lastAutoTable.finalY + 8;

    // Tableau des achats
    const rows = this.achatsFiltres.map(a => [
      `#${a.id}`,
      this.formatDate(a.dateAchat || a.dateCreation),
      this.fmt(a.montantTotal),
      this.fmt(a.montantPaye),
      this.fmt(a.montantRestant),
      this.statutLabel(a.statut),
      (a.lignes || []).map(l => `${l.produit?.nom || '?'} x${l.quantite}`).join(', ') || '—',
      a.commentaire || '—'
    ]);

    autoTable(doc, {
      startY: y,
      head: [['N°', 'Date', 'Total', 'Payé', 'Restant', 'Statut', 'Produits', 'Commentaire']],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 22 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 80 },
        7: { cellWidth: 40 }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = data.cell.text[0] || '';
          if (val === 'Payé') doc.setTextColor(22, 163, 74);
          else if (val === 'Annulé') doc.setTextColor(220, 38, 38);
          else doc.setTextColor(245, 158, 11);
        }
      },
      margin: { left: 8, right: 8 }
    });

    this.ajouterPiedDePage(doc);
    doc.save(`achats-${fournisseur.code || fournisseur.nom}-${now.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
  }

  // ══════════════════════════════════════════
  // PDF — SITUATION FOURNISSEUR
  // ══════════════════════════════════════════

  telechargerPdfSituation(): void {
    if (!this.situation) {
      Swal.fire({ icon: 'info', title: 'Aucune situation', text: 'Chargez d\'abord la situation du fournisseur.' }); return;
    }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date();
    const f = this.situation.fournisseur;

    // En-tête
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SITUATION FOURNISSEUR', pageW / 2, 13, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${f.nom} — Code : ${f.code || '—'}`, pageW / 2, 21, { align: 'center' });
    doc.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, pageW / 2, 28, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    let y = 42;

    // Infos fournisseur
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations fournisseur', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      body: [
        ['Téléphone', f.telephone || '—', 'Email', f.email || '—'],
        ['Adresse', f.adresse || '—', 'Type produits', f.typeProduits || '—'],
        ['Conditions paiement', f.conditionsPaiement || '—', 'Statut', f.actif ? 'Actif' : 'Inactif']
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [239, 246, 255], cellWidth: 40 },
        1: { cellWidth: 55 },
        2: { fontStyle: 'bold', fillColor: [239, 246, 255], cellWidth: 40 },
        3: { cellWidth: 55 }
      },
      margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Résumé financier
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé financier', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Indicateur', 'Montant']],
      body: [
        ['Total achats', this.fmt(this.situation.totalAchats)],
        ['Total payé', this.fmt(this.situation.totalPaye)],
        ['Solde dû (reste à payer)', this.fmt(this.situation.solde)]
      ],
      styles: { fontSize: 11, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235] },
      bodyStyles: { valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 80 }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.row.index === 2 && data.column.index === 1) {
          const solde = this.situation?.solde || 0;
          if (solde > 0) doc.setTextColor(220, 38, 38);
          else doc.setTextColor(22, 163, 74);
        }
      },
      margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Achats récents
    if (this.situation.achatsRecents?.length) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Derniers achats (${this.situation.achatsRecents.length})`, 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Total', 'Payé', 'Restant', 'Statut']],
        body: this.situation.achatsRecents.map(a => [
          this.formatDate(a.dateAchat || a.dateCreation),
          this.fmt(a.montantTotal),
          this.fmt(a.montantPaye),
          this.fmt(a.montantRestant),
          this.statutLabel(a.statut)
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235] },
        columnStyles: {
          1: { halign: 'right' }, 2: { halign: 'right' },
          3: { halign: 'right' }, 4: { halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Paiements récents
    if (this.situation.paiementsRecents?.length) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Derniers paiements (${this.situation.paiementsRecents.length})`, 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Montant', 'Mode', 'Référence']],
        body: this.situation.paiementsRecents.map(p => [
          this.formatDate(p.datePaiement),
          this.fmt(p.montant),
          p.modePaiement || '—',
          p.reference || '—'
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235] },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: 14, right: 14 }
      });
    }

    this.ajouterPiedDePage(doc);
    doc.save(`situation-${f.code || f.nom}-${now.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
  }

  // ══════════════════════════════════════════
  // PDF — TOUS FOURNISSEURS (récapitulatif)
  // ══════════════════════════════════════════

  telechargerPdfTousFournisseurs(): void {
    if (!this.fournisseurs.length) {
      Swal.fire({ icon: 'info', title: 'Aucun fournisseur', text: 'La liste est vide.' }); return;
    }
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date();

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LISTE DES FOURNISSEURS', pageW / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.fournisseurs.length} fournisseur(s) — Généré le ${now.toLocaleDateString('fr-FR')}`, pageW / 2, 21, { align: 'center' });

    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 35,
      head: [['Nom', 'Code', 'Téléphone', 'Email', 'Type produits', 'Total achats', 'Solde dû', 'Statut']],
      body: this.fournisseurs.map(f => [
        f.nom, f.code || '—', f.telephone || '—', f.email || '—',
        f.typeProduits || '—',
        this.fmt(f.totalAchats || 0),
        this.fmt(f.solde || 0),
        f.actif ? 'Actif' : 'Inactif'
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: {
        5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'center' }
      },
      margin: { left: 8, right: 8 }
    });

    this.ajouterPiedDePage(doc);
    doc.save(`fournisseurs-${now.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
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

  private ajouterPiedDePage(doc: jsPDF): void {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageH = doc.internal.pageSize.getHeight();
    const pageW = doc.internal.pageSize.getWidth();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} / ${pageCount}`, pageW / 2, pageH - 6, { align: 'center' });
      doc.text('Ges Boutique — Document confidentiel', 14, pageH - 6);
    }
  }
}
