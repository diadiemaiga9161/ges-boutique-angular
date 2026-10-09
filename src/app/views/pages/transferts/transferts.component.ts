import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  TransfertService, TransfertStock, BoutiquePartenaire, TransfertRequest, PaiementTransfert
} from '../../../shared/services/transfert.service';
import { ProductService } from '../../../shared/services/product.service';
import { FactureService } from '../../../shared/services/facture.service';
import { TranslateModule } from '@ngx-translate/core';
import { MontantInputDirective } from '../../../shared/directives/montant-input.directive';

import { MesurePuPipe, MesureQtePipe, MesureSuffixePipe } from '../../../shared/pipes/mesure.pipe';
import { qteDoc, puDoc } from '../../../shared/utils/mesure.util';

import { ActionPermission, RoleService } from '../../../shared/services/role.service';
@Component({
  selector: 'app-transferts',
  templateUrl: './transferts.component.html',
  styleUrls: ['./transferts.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MontantInputDirective, MesureQtePipe, MesurePuPipe, MesureSuffixePipe]
})
export class TransfertsComponent implements OnInit {

  transferts: TransfertStock[] = [];
  partenaires: BoutiquePartenaire[] = [];
  produits: any[] = [];
  isLoading = false;

  // Onglets
  ongletActif: 'tous' | 'envoyes' | 'recus' = 'tous';
  transfertsEnvoyes: TransfertStock[] = [];
  transfertsRecus: TransfertStock[] = [];
  nbEnAttente = 0;

  // Formulaire nouveau transfert
  afficherFormulaire = false;
  editingTransfert: TransfertStock | null = null;
  form: TransfertRequest = {
    boutiqueDestId: 0,
    typePaiement: 'SANS_PAIEMENT',
    notes: '',
    lignes: []
  };

  // Formulaire partenaire
  afficherFormPartenaire = false;
  editingPartenaire: BoutiquePartenaire | null = null;
  formPartenaire: BoutiquePartenaire = { nom: '', url: '', actif: true };

  // Détail
  transfertDetail: TransfertStock | null = null;

  // Produits de la boutique destinataire
  produitsBoutiqueDestinee: any[] = [];
  chargementProduitsDest = false;

  // Paiements inter-boutiques
  paiementsTransfert: PaiementTransfert[] = [];
  afficherFormPaiement = false;
  formPaiement = { montant: 0, modePaiement: 'ESPECES', notes: '' };
  savingPaiement = false;

  readonly MODES_PAIEMENT = [
    { v: 'ESPECES', l: 'Espèces' },
    { v: 'ORANGE_MONEY', l: 'Orange Money' },
    { v: 'MOOV_MONEY', l: 'Moov Money' },
    { v: 'WAVE_MONEY', l: 'Wave Money' },
    { v: 'VIREMENT', l: 'Virement' }
  ];

  readonly TYPES_PAIEMENT = [
    { v: 'SANS_PAIEMENT', l: 'Sans paiement' },
    { v: 'IMMEDIAT',      l: 'Paiement immédiat' },
    { v: 'CREDIT',        l: 'Crédit' }
  ];

  readonly STATUT_LABELS: Record<string, string> = {
    CREE: 'Créé',
    EN_ATTENTE_CONFIRMATION: 'En attente',
    EN_ATTENTE: 'En attente',
    CONFIRME: 'Confirmé',
    ACCEPTE: 'Accepté',
    REJETE: 'Rejeté',
    COMPLETE: 'Complété',
    ANNULE: 'Annulé'
  };

  readonly STATUT_COLORS: Record<string, string> = {
    CREE: 'primary',
    EN_ATTENTE_CONFIRMATION: 'warning',
    EN_ATTENTE: 'warning',
    CONFIRME: 'success',
    ACCEPTE: 'success',
    REJETE: 'danger',
    COMPLETE: 'info',
    ANNULE: 'secondary'
  };

  constructor(
    private roleService: RoleService,
    private transfertService: TransfertService,
    private produitService: ProductService,
    private factureService: FactureService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.chargerPartenaires();
    this.chargerProduits();
    this.chargerOnglets();
  }

  charger(): void {
    this.isLoading = true;
    this.transfertService.getTout().subscribe({
      next: t => { this.transferts = t; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  chargerPartenaires(): void {
    this.transfertService.getPartenaires().subscribe(p => this.partenaires = p);
  }

  chargerProduits(): void {
    this.produitService.getProducts().subscribe(p => this.produits = p);
  }

  // ── Formulaire transfert ──

  nouveauTransfert(): void {
    this.editingTransfert = null;
    this.form = { boutiqueDestId: 0, typePaiement: 'SANS_PAIEMENT', notes: '', lignes: [] };
    this.ajouterLigne();
    this.afficherFormulaire = true;
  }

  editerTransfert(t: TransfertStock): void {
    if (t.statut === 'CONFIRME' || t.statut === 'ANNULE') return;
    this.editingTransfert = t;
    const dest = this.partenaires.find(p => p.nom === t.boutiqueDestNom);
    this.form = {
      boutiqueDestId: dest?.id ?? 0,
      typePaiement: t.typePaiement,
      notes: t.notes ?? '',
      lignes: t.lignes.map(l => ({
        produitId: l.produitId,
        produitNom: l.produitNom,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire
      }))
    };
    this.afficherFormulaire = true;
  }

  ajouterLigne(): void {
    this.form.lignes.push({ produitId: 0, produitNom: '', quantite: 1 });
  }

  supprimerLigne(i: number): void {
    this.form.lignes.splice(i, 1);
  }

  onProduitChange(i: number): void {
    const p = this.produits.find(pr => pr.id === +this.form.lignes[i].produitId);
    if (p) {
      this.form.lignes[i].produitNom = p.nom;
      this.form.lignes[i].prixUnitaire = p.prixVente;
    }
  }

  sauvegarder(): void {
    if (!this.form.boutiqueDestId || this.form.lignes.length === 0) {
      Swal.fire('Erreur', 'Sélectionnez une boutique destination et ajoutez au moins un produit', 'error');
      return;
    }
    const obs$ = this.editingTransfert
      ? this.transfertService.modifier(this.editingTransfert.id!, this.form)
      : this.transfertService.creer(this.form);

    obs$.subscribe({
      next: (t: any) => {
        this.afficherFormulaire = false;
        this.charger();
        // Le stock a bien été retiré ici, mais si la notification vers la boutique de
        // destination a échoué (adresse injoignable, clé invalide...), il ne faut surtout
        // pas dire "succès" — rien n'est arrivé de l'autre côté tant que ce n'est pas corrigé.
        if (t?.statut === 'ECHEC_NOTIFICATION') {
          Swal.fire({
            icon: 'warning',
            title: 'Transfert non reçu par la destination',
            html: `Le stock a été retiré ici, mais <strong>${t.boutiqueDestNom || 'la boutique de destination'}</strong> n'a rien reçu (adresse injoignable ou incorrecte).<br><br>Vérifiez la configuration de ce partenaire (menu Config Partenaires) avant de réessayer.`,
            confirmButtonText: 'Compris'
          });
          return;
        }
        Swal.fire('Succès', this.editingTransfert ? 'Transfert modifié' : 'Transfert créé', 'success');
      },
      error: e => Swal.fire('Erreur', e.error?.message ?? 'Erreur', 'error')
    });
  }

  confirmer(t: TransfertStock): void {
    Swal.fire({
      title: 'Confirmer définitivement ?',
      text: 'Une fois confirmé, aucune modification ne sera possible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.transfertService.confirmer(t.id!).subscribe({
          next: () => { this.charger(); Swal.fire('Confirmé !', '', 'success'); },
          error: e => Swal.fire('Erreur', e.error?.message, 'error')
        });
      }
    });
  }

  annuler(t: TransfertStock): void {
    Swal.fire({
      title: 'Motif d\'annulation',
      input: 'text',
      inputPlaceholder: 'Raison de l\'annulation',
      showCancelButton: true,
      confirmButtonText: 'Annuler le transfert',
      cancelButtonText: 'Retour',
      icon: 'question'
    }).then(r => {
      if (r.isConfirmed) {
        this.transfertService.annuler(t.id!, r.value).subscribe({
          next: () => { this.charger(); Swal.fire('Annulé', '', 'info'); },
          error: e => Swal.fire('Erreur', e.error?.message, 'error')
        });
      }
    });
  }

  voirDetail(t: TransfertStock): void {
    this.paiementsTransfert = [];
    this.afficherFormPaiement = false;
    this.transfertService.getById(t.id!).subscribe(detail => {
      this.transfertDetail = detail;
      this.chargerPaiements(detail.id!);
    });
  }

  chargerPaiements(transfertId: number): void {
    this.transfertService.getPaiementsTransfert(transfertId).subscribe(p => this.paiementsTransfert = p);
  }

  enregistrerPaiement(): void {
    if (!this.transfertDetail || !this.formPaiement.montant) return;
    this.savingPaiement = true;
    this.transfertService.ajouterPaiement(this.transfertDetail.id!, this.formPaiement).subscribe({
      next: () => {
        this.savingPaiement = false;
        this.afficherFormPaiement = false;
        this.chargerPaiements(this.transfertDetail!.id!);
        Swal.fire('Paiement enregistré', '', 'success');
      },
      error: e => { this.savingPaiement = false; Swal.fire('Erreur', e.error?.message, 'error'); }
    });
  }

  onBoutiqueDestChange(): void {
    if (!this.form.boutiqueDestId) { this.produitsBoutiqueDestinee = []; return; }
    this.chargementProduitsDest = true;
    this.transfertService.getProduitsBoutique(this.form.boutiqueDestId).subscribe({
      next: p => { this.produitsBoutiqueDestinee = p; this.chargementProduitsDest = false; },
      error: () => this.chargementProduitsDest = false
    });
  }

  labelModePaiement(v: string): string {
    return this.MODES_PAIEMENT.find(m => m.v === v)?.l ?? v;
  }

  getNomPartenaire(id: number): string {
    return this.partenaires.find(p => p.id === +id)?.nom ?? '';
  }

  exporterFacture(): void {
    if (!this.transfertDetail) return;
    const t = this.transfertDetail;
    const lignesHtml = t.lignes.map(l =>
      `<tr><td>${l.produitNom}</td><td style="text-align:right">${qteDoc(l)}</td>
       <td style="text-align:right">${l.prixUnitaire ? puDoc(l, v => this.fmt(v)) : '—'}</td>
       <td style="text-align:right">${l.prixUnitaire ? this.fmt(l.prixUnitaire * l.quantite) : '—'}</td></tr>`
    ).join('');

    const total = t.lignes.reduce((s, l) => s + (l.prixUnitaire ? l.prixUnitaire * l.quantite : 0), 0);

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Facture ${t.numeroTransfert}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:32px;color:#111}
      h1{color:#3b82f6;margin-bottom:4px}
      .meta{display:flex;gap:40px;margin:20px 0;padding:16px;background:#f9fafb;border-radius:8px}
      .meta div{flex:1}
      .label{font-size:11px;color:#6b7280;margin-bottom:2px}
      .val{font-weight:600}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #e5e7eb;padding:8px 10px;font-size:12px}
      th{background:#f3f4f6;font-weight:700}
      tfoot td{font-weight:700;background:#f0fdf4}
      .badge{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;
             background:${t.statut === 'CONFIRME' ? '#dcfce7' : '#fef9c3'};
             color:${t.statut === 'CONFIRME' ? '#16a34a' : '#92400e'}}
      @media print{button{display:none}}
    </style></head><body>
    <h1>Facture de transfert</h1>
    <p style="color:#6b7280">${t.numeroTransfert} &nbsp;|&nbsp; <span class="badge">${this.STATUT_LABELS[t.statut]}</span></p>
    <div class="meta">
      <div><div class="label">Boutique source</div><div class="val">${t.boutiqueSourceNom}</div></div>
      <div><div class="label">Boutique destination</div><div class="val">${t.boutiqueDestNom}</div></div>
      <div><div class="label">Paiement</div><div class="val">${this.TYPES_PAIEMENT.find(tp => tp.v === t.typePaiement)?.l ?? t.typePaiement}</div></div>
      <div><div class="label">Date</div><div class="val">${new Date(t.dateCreation!).toLocaleDateString('fr-FR')}</div></div>
    </div>
    <table>
      <thead><tr><th>Produit</th><th style="text-align:right">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${lignesHtml}</tbody>
      <tfoot><tr><td colspan="3">TOTAL</td><td style="text-align:right">${this.fmt(total)}</td></tr></tfoot>
    </table>
    ${t.notes ? `<p style="margin-top:16px;color:#6b7280"><em>Notes : ${t.notes}</em></p>` : ''}
    <br><button onclick="window.print()" style="background:#3b82f6;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">Imprimer</button>
    <script>window.addEventListener('afterprint',()=>window.close());<\/script>
    </body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 300);
  }

  // ── Partenaires ──

  nouveauPartenaire(): void {
    this.editingPartenaire = null;
    this.formPartenaire = { nom: '', url: '', actif: true };
    this.afficherFormPartenaire = true;
  }

  editerPartenaire(p: BoutiquePartenaire): void {
    this.editingPartenaire = p;
    this.formPartenaire = { ...p };
    this.afficherFormPartenaire = true;
  }

  sauvegarderPartenaire(): void {
    const obs$ = this.editingPartenaire
      ? this.transfertService.modifierPartenaire(this.editingPartenaire.id!, this.formPartenaire)
      : this.transfertService.ajouterPartenaire(this.formPartenaire);
    obs$.subscribe({
      next: () => { this.afficherFormPartenaire = false; this.chargerPartenaires(); },
      error: e => Swal.fire('Erreur', e.error?.message, 'error')
    });
  }

  supprimerPartenaire(p: BoutiquePartenaire): void {
    Swal.fire({ title: 'Supprimer ' + p.nom + ' ?', icon: 'warning', showCancelButton: true })
      .then(r => {
        if (r.isConfirmed) {
          this.transfertService.supprimerPartenaire(p.id!).subscribe(() => this.chargerPartenaires());
        }
      });
  }

  chargerOnglets(): void {
    this.transfertService.getEnvoyes().subscribe({
      next: t => { this.transfertsEnvoyes = t; },
      error: () => {}
    });
    this.transfertService.getRecus().subscribe({
      next: t => {
        this.transfertsRecus = t;
        this.nbEnAttente = t.filter(tr =>
          tr.statut === 'EN_ATTENTE_CONFIRMATION' || tr.statut === 'EN_ATTENTE'
        ).length;
      },
      error: () => {}
    });
  }

  changerOnglet(o: 'tous' | 'envoyes' | 'recus'): void {
    this.ongletActif = o;
    if (o === 'envoyes' || o === 'recus') this.chargerOnglets();
  }

  get transfertsAffiches(): TransfertStock[] {
    if (this.ongletActif === 'envoyes') return this.transfertsEnvoyes;
    if (this.ongletActif === 'recus') return this.transfertsRecus;
    return this.transferts;
  }

  private moneyFmt(v: number): string {
    return Math.round(v || 0).toLocaleString('fr-FR') + ' FCFA';
  }

  private statutLabelTransfert(s: string): string {
    const labels: { [k: string]: string } = {
      CREE: 'Créé', EN_ATTENTE_CONFIRMATION: 'En attente', EN_ATTENTE: 'En attente',
      CONFIRME: 'Confirmé', ACCEPTE: 'Accepté', REJETE: 'Rejeté', COMPLETE: 'Complété',
      ANNULE: 'Annulé', ECHEC_NOTIFICATION: 'Échec envoi'
    };
    return labels[s] || s;
  }

  /** Traçabilité imprimable des transferts (onglet actif : Tous/Envoyés/Reçus), sur le
   *  même principe que la Situation Fournisseur — historique chronologique + totaux. */
  imprimerTransferts(): void {
    const liste = this.transfertsAffiches;
    if (!liste.length) {
      Swal.fire({ icon: 'info', title: 'Aucun transfert', text: 'Aucun transfert à imprimer pour cet onglet.' });
      return;
    }
    const ongletLabels: { [k: string]: string } = { tous: 'Tous', envoyes: 'Envoyés', recus: 'Reçus' };

    const lignes = liste.map(t => {
      const montantTotal = (t.lignes || []).reduce((s, l) => s + (l.montantTotal || (l.prixUnitaire || 0) * l.quantite), 0);
      const nbProduits = (t.lignes || []).length;
      return [
        t.numeroTransfert || '—',
        t.dateCreation ? new Date(t.dateCreation).toLocaleDateString('fr-FR') : '—',
        t.boutiqueSourceNom || '—',
        t.boutiqueDestNom || '—',
        `${nbProduits} produit(s)`,
        this.moneyFmt(montantTotal),
        this.statutLabelTransfert(t.statut)
      ];
    });

    const totalGeneral = liste.reduce((s, t) =>
      s + (t.lignes || []).reduce((s2, l) => s2 + (l.montantTotal || (l.prixUnitaire || 0) * l.quantite), 0), 0);

    this.factureService.ouvrirDocumentPDF({
      titre: 'Traçabilité des transferts',
      sousTitre: `${ongletLabels[this.ongletActif]} — ${liste.length} transfert(s)`,
      colonnes: ['N° Transfert', 'Date', 'Source', 'Destination', 'Produits', 'Montant', 'Statut'],
      lignes,
      totaux: [
        { label: 'Nombre de transferts', valeur: String(liste.length) },
        { label: 'Montant total', valeur: this.moneyFmt(totalGeneral) }
      ],
      pied: `Onglet : ${ongletLabels[this.ongletActif]}`,
      paysage: true
    });
  }

  accepterTransfert(t: TransfertStock): void {
    Swal.fire({
      title: 'Accepter ce transfert ?',
      text: 'Les produits seront ajoutés à votre stock.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Accepter',
      cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.transfertService.accepter(t.id!).subscribe({
          next: () => { this.charger(); this.chargerOnglets(); Swal.fire('Accepté !', 'Stock mis à jour.', 'success'); },
          error: e => Swal.fire('Erreur', e.error?.message ?? 'Erreur', 'error')
        });
      }
    });
  }

  rejeterTransfert(t: TransfertStock): void {
    Swal.fire({
      title: 'Rejeter ce transfert ?',
      input: 'text',
      inputPlaceholder: 'Motif du rejet (optionnel)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Rejeter',
      cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.transfertService.rejeter(t.id!, r.value).subscribe({
          next: () => { this.charger(); this.chargerOnglets(); Swal.fire('Rejeté', '', 'info'); },
          error: e => Swal.fire('Erreur', e.error?.message ?? 'Erreur', 'error')
        });
      }
    });
  }

  labelPaiement(v: string): string {
    return this.TYPES_PAIEMENT.find(tp => tp.v === v)?.l ?? v;
  }

  fmt(v: number): string {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(v) + ' FCFA';
  }

  get totalPaiements(): number {
    return this.paiementsTransfert.reduce((s, p) => s + (p.montant || 0), 0);
  }

  /** Bouton visible seulement si le rôle de la personne permet l'action (rôles personnalisés). */
  peut(module: string, action: ActionPermission): boolean {
    return this.roleService.peut(module, action);
  }
}
