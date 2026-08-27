// src/app/views/pages/export-donnees/export-donnees.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

import { AuthService } from '../../../shared/services/auth.service';
import { ClientService } from '../../../shared/services/client.service';
import { ProductService } from '../../../shared/services/product.service';
import { VenteService } from '../../../shared/services/vente.service';
import { DepenseService } from '../../../shared/services/depense.service';
import { EmployeService } from '../../../shared/services/employe.service';
import { DetteAncienneService } from '../../../shared/services/dette-ancienne.service';
import { TransfertService } from '../../../shared/services/transfert.service';
import { FactureService } from '../../../shared/services/facture.service';

type CategorieExport =
  | 'clients'
  | 'produits'
  | 'ventes'
  | 'fournisseurs'
  | 'depenses'
  | 'employes'
  | 'credits'
  | 'transferts';

interface CategorieOption {
  value: CategorieExport;
  labelKey: string;
  icon: string;
  avecPeriode: boolean;
}

interface DonneesExport {
  titre: string;
  colonnes: string[];
  lignes: any[][];
}

@Component({
  selector: 'app-export-donnees',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './export-donnees.component.html',
  styleUrls: ['./export-donnees.component.scss']
})
export class ExportDonneesComponent {

  // Liste FERMÉE des catégories exportables (ne pas en ajouter d'autres sans validation du patron)
  categories: CategorieOption[] = [
    { value: 'clients',      labelKey: 'EXPORT.CATEGORY_CLIENTS',   icon: 'fa-user-friends',        avecPeriode: false },
    { value: 'produits',     labelKey: 'EXPORT.CATEGORY_PRODUCTS',  icon: 'fa-box-open',             avecPeriode: false },
    { value: 'ventes',       labelKey: 'EXPORT.CATEGORY_SALES',     icon: 'fa-cash-register',         avecPeriode: true },
    { value: 'fournisseurs', labelKey: 'EXPORT.CATEGORY_SUPPLIERS', icon: 'fa-truck',                 avecPeriode: false },
    { value: 'depenses',     labelKey: 'EXPORT.CATEGORY_EXPENSES',  icon: 'fa-file-invoice-dollar',    avecPeriode: true },
    { value: 'employes',     labelKey: 'EXPORT.CATEGORY_EMPLOYEES', icon: 'fa-id-badge',               avecPeriode: false },
    { value: 'credits',      labelKey: 'EXPORT.CATEGORY_DEBTS',     icon: 'fa-hand-holding-usd',       avecPeriode: true },
    { value: 'transferts',   labelKey: 'EXPORT.CATEGORY_TRANSFERS', icon: 'fa-exchange-alt',           avecPeriode: true },
  ];

  categorieSelectionnee: CategorieExport = 'clients';
  format: 'excel' | 'pdf' = 'excel';
  dateDebut: string = '';
  dateFin: string = '';
  chargement: boolean = false;
  chargementApercu: boolean = false;
  donneesApercu: DonneesExport | null = null;

  constructor(
    public authService: AuthService,
    private clientService: ClientService,
    private productService: ProductService,
    private venteService: VenteService,
    private depenseService: DepenseService,
    private employeService: EmployeService,
    private detteService: DetteAncienneService,
    private transfertService: TransfertService,
    private factureService: FactureService,
    private translate: TranslateService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get categorieActive(): CategorieOption {
    return this.categories.find(c => c.value === this.categorieSelectionnee) || this.categories[0];
  }

  selectionnerCategorie(cat: CategorieExport): void {
    this.categorieSelectionnee = cat;
    this.donneesApercu = null;
  }

  resetDateFilter(): void {
    this.dateDebut = '';
    this.dateFin = '';
  }

  // ==================== APERÇU À L'ÉCRAN ====================

  apercu(): void {
    if (!this.isAdmin) return;
    this.chargementApercu = true;
    this.donneesApercu = null;
    this.chargerDonnees().subscribe({
      next: (donnees) => {
        this.chargementApercu = false;
        this.donneesApercu = donnees;
        if (!donnees.lignes.length) {
          Swal.fire({
            icon: 'info',
            title: this.t('EXPORT.NO_DATA_TITLE'),
            text: this.t('EXPORT.NO_DATA_TEXT'),
            confirmButtonColor: '#1a56db'
          });
        }
      },
      error: (err) => {
        this.chargementApercu = false;
        Swal.fire({ icon: 'error', title: this.t('COMMON.ERROR'), text: err?.message || 'Erreur', confirmButtonColor: '#dc3545' });
      }
    });
  }

  // ==================== LANCEMENT DE L'EXPORT ====================

  exporter(): void {
    if (!this.isAdmin) return;
    this.chargement = true;
    this.chargerDonnees().subscribe({
      next: (donnees) => {
        this.chargement = false;
        if (!donnees.lignes.length) {
          Swal.fire({
            icon: 'info',
            title: this.t('EXPORT.NO_DATA_TITLE'),
            text: this.t('EXPORT.NO_DATA_TEXT'),
            confirmButtonColor: '#1a56db'
          });
          return;
        }
        if (this.format === 'excel') {
          this.exporterExcel(donnees);
        } else {
          this.exporterPdf(donnees);
        }
      },
      error: (err) => {
        this.chargement = false;
        Swal.fire({ icon: 'error', title: this.t('COMMON.ERROR'), text: err?.message || 'Erreur', confirmButtonColor: '#dc3545' });
      }
    });
  }

  private chargerDonnees(): Observable<DonneesExport> {
    switch (this.categorieSelectionnee) {
      case 'clients':      return this.chargerClients();
      case 'produits':     return this.chargerProduits();
      case 'ventes':       return this.chargerVentes();
      case 'fournisseurs': return this.chargerFournisseurs();
      case 'depenses':     return this.chargerDepenses();
      case 'employes':     return this.chargerEmployes();
      case 'credits':      return this.chargerCredits();
      case 'transferts':   return this.chargerTransferts();
    }
  }

  // ==================== CHARGEMENT PAR CATÉGORIE ====================

  private chargerClients(): Observable<DonneesExport> {
    return this.clientService.getAll().pipe(
      map(clients => ({
        titre: this.t('EXPORT.CATEGORY_CLIENTS'),
        colonnes: [
          this.t('CLIENTS.NAME'), this.t('CLIENTS.FIRSTNAME'), this.t('CLIENTS.PHONE'),
          this.t('CLIENTS.ADDRESS'), this.t('CLIENTS.EMAIL'), this.t('CLIENTS.PARTNER')
        ],
        lignes: clients.map(c => [
          c.nom || '-',
          c.prenom || '-',
          c.numeroTelephone || c.telephone || '-',
          c.adresse || '-',
          c.email || '-',
          c.partenaire ? this.t('COMMON.YES') : this.t('COMMON.NO')
        ])
      }))
    );
  }

  private chargerProduits(): Observable<DonneesExport> {
    return this.productService.getProducts().pipe(
      map(produits => ({
        titre: this.t('EXPORT.CATEGORY_PRODUCTS'),
        colonnes: [
          this.t('PRODUCTS.NAME'), this.t('PRODUCTS.CATEGORY'), this.t('PRODUCTS.SUPPLIER'),
          this.t('PRODUCTS.PRICE_BUY'), this.t('PRODUCTS.PRICE_SELL'), this.t('PRODUCTS.STOCK'),
          this.t('PRODUCTS.ALERT_THRESHOLD'), this.t('PRODUCTS.BARCODE')
        ],
        lignes: produits.map(p => [
          p.nom,
          p.categorie?.nom || '-',
          p.fournisseur?.nom || '-',
          this.formatMontant(p.prixAchat) + ' F',
          this.formatMontant(p.prixVente) + ' F',
          p.quantite,
          p.seuilAlerte,
          p.codeBarre || '-'
        ])
      }))
    );
  }

  private chargerVentes(): Observable<DonneesExport> {
    return this.venteService.getAllVentes(true).pipe(
      map(ventes => ventes.filter(v => this.dansPeriode(v.dateVente))),
      map(ventes => ({
        titre: this.t('EXPORT.CATEGORY_SALES'),
        colonnes: ['N°', this.t('COMMON.DATE'), this.t('SALES.SELLER'), this.t('CLIENTS.TITLE'),
          this.t('COMMON.AMOUNT'), this.t('SALES.PAYMENT_MODE'), this.t('SALES.CASH') + '/' + this.t('SALES.CREDIT'),
          this.t('EXPORT.CANCELLED')],
        lignes: ventes.map(v => [
          v.numeroVente || `#${v.id}`,
          this.formatDate(v.dateVente),
          v.vendeurNom || '-',
          v.clientDivers ? 'Client divers' : ([v.clientPrenom, v.clientNom].filter(Boolean).join(' ') || '-'),
          this.formatMontant(v.montantTotal) + ' F',
          v.modePaiement || '-',
          v.estCredit ? this.t('SALES.CREDIT') : this.t('SALES.CASH'),
          v.annulee ? this.t('COMMON.YES') : this.t('COMMON.NO')
        ])
      }))
    );
  }

  private chargerFournisseurs(): Observable<DonneesExport> {
    return this.productService.getAllFournisseurs().pipe(
      map(fournisseurs => ({
        titre: this.t('EXPORT.CATEGORY_SUPPLIERS'),
        colonnes: [this.t('CLIENTS.NAME'), 'Code', this.t('CLIENTS.PHONE'), this.t('CLIENTS.EMAIL'),
          this.t('COMMON.STATUS'), 'Total achats', 'Total payé', 'Solde'],
        lignes: fournisseurs.map(f => [
          f.nom,
          f.code || '-',
          f.telephone || '-',
          f.email || '-',
          f.actif ? 'Actif' : 'Inactif',
          this.formatMontant(f.totalAchats) + ' F',
          this.formatMontant(f.totalPaye) + ' F',
          this.formatMontant(f.solde) + ' F'
        ])
      }))
    );
  }

  private chargerDepenses(): Observable<DonneesExport> {
    return this.depenseService.getAll().pipe(
      map(r => (r.depenses || []).filter(d => this.dansPeriode(d.date))),
      map(depenses => ({
        titre: this.t('EXPORT.CATEGORY_EXPENSES'),
        colonnes: [this.t('CLIENTS.NAME'), 'Motif', this.t('COMMON.DATE'), this.t('COMMON.AMOUNT'), 'Type'],
        lignes: depenses.map(d => [
          d.nom,
          d.motif || '-',
          this.formatDate(d.date),
          this.formatMontant(d.montant) + ' F',
          d.typeDepense || '-'
        ])
      }))
    );
  }

  private chargerEmployes(): Observable<DonneesExport> {
    return this.employeService.getTous().pipe(
      map(employes => ({
        titre: this.t('EXPORT.CATEGORY_EMPLOYEES'),
        colonnes: [this.t('CLIENTS.NAME'), 'Poste', 'Salaire mensuel', this.t('CLIENTS.PHONE'), this.t('COMMON.STATUS'), 'Date embauche'],
        lignes: employes.map(e => [
          e.nomComplet || [e.prenom, e.nom].filter(Boolean).join(' '),
          e.poste || '-',
          this.formatMontant(e.salaireMensuel) + ' F',
          e.telephone || '-',
          e.statut === 'ACTIF' ? 'Actif' : 'Inactif',
          e.dateEmbauche ? this.formatDate(e.dateEmbauche) : '-'
        ])
      }))
    );
  }

  private chargerCredits(): Observable<DonneesExport> {
    return this.detteService.getAllDettes().pipe(
      map(dettes => dettes.filter(d => this.dansPeriode(d.dateCredit))),
      map(dettes => ({
        titre: this.t('EXPORT.CATEGORY_DEBTS'),
        colonnes: [this.t('CLIENTS.TITLE'), this.t('CLIENTS.PHONE'), this.t('COMMON.DATE'),
          'Montant initial', 'Reste dû', this.t('COMMON.STATUS'), 'Description'],
        lignes: dettes.map(d => [
          [d.clientPrenom, d.clientNom].filter(Boolean).join(' ') || `Client #${d.clientId}`,
          d.clientTelephone || '-',
          this.formatDate(d.dateCredit),
          this.formatMontant(d.montantInitial) + ' F',
          this.formatMontant(d.montantRestant) + ' F',
          d.estReglee ? 'Réglée' : 'Non réglée',
          d.description || '-'
        ])
      }))
    );
  }

  private chargerTransferts(): Observable<DonneesExport> {
    return this.transfertService.getTout().pipe(
      map(transferts => transferts.filter(t => this.dansPeriode(t.dateCreation))),
      map(transferts => ({
        titre: this.t('EXPORT.CATEGORY_TRANSFERS'),
        colonnes: ['N°', 'Boutique source', 'Boutique destination', this.t('COMMON.STATUS'), 'Type paiement', this.t('COMMON.DATE'), 'Nb produits'],
        lignes: transferts.map(t => [
          t.numeroTransfert || `#${t.id}`,
          t.boutiqueSourceNom || '-',
          t.boutiqueDestNom || '-',
          t.statut || '-',
          t.typePaiement || '-',
          this.formatDate(t.dateCreation),
          (t.lignes || []).length
        ])
      }))
    );
  }

  // ==================== EXPORT EXCEL ====================

  private exporterExcel(donnees: DonneesExport): void {
    const data = [donnees.colonnes, ...donnees.lignes];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, donnees.titre.substring(0, 31));
    const nomFichier = `${this.slugify(donnees.titre)}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nomFichier);
  }

  // ==================== EXPORT PDF ====================

  private exporterPdf(donnees: DonneesExport): void {
    const periodeLabel = (this.dateDebut || this.dateFin)
      ? `Du ${this.dateDebut ? this.formatDate(this.dateDebut) : '…'} au ${this.dateFin ? this.formatDate(this.dateFin) : '…'}`
      : '';
    this.factureService.ouvrirDocumentPDF({
      titre: donnees.titre,
      sousTitre: `${donnees.lignes.length} ${this.t('EXPORT.ITEMS_FOUND')}${periodeLabel ? ' — ' + periodeLabel : ''}`,
      colonnes: donnees.colonnes,
      lignes: donnees.lignes,
      paysage: true
    });
  }

  // ==================== UTILITAIRES ====================

  private t(key: string): string {
    return this.translate.instant(key);
  }

  private dansPeriode(dateStr?: string): boolean {
    if (!this.dateDebut && !this.dateFin) return true;
    if (!dateStr) return false;
    const d = dateStr.substring(0, 10);
    if (this.dateDebut && d < this.dateDebut) return false;
    if (this.dateFin && d > this.dateFin) return false;
    return true;
  }

  private formatDate(date?: string): string {
    if (!date) return '-';
    try { return new Date(date).toLocaleDateString('fr-FR'); } catch { return date; }
  }

  private formatMontant(v?: number): string {
    return (v === undefined || v === null) ? '0' : Math.round(v).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }

  private slugify(s: string): string {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '').toLowerCase() || 'export';
  }
}
