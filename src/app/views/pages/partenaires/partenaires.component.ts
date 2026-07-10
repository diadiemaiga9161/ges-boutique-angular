// src/app/views/pages/partenaires/partenaires.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService, Client, AvanceClient, AvanceClientRequest, HistoriqueAvanceResponse } from '../../../shared/services/client.service';
import { AuthService } from '../../../shared/services/auth.service';
import { VenteService, VenteMap } from '../../../shared/services/vente.service';
import { CaisseService } from '../../../shared/services/caisse.service';
import { DesignFacture, FactureDesignService } from '../../../shared/services/facture-design.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

interface HistoriquePaiementEntry {
  date: string;
  montant: number;
  typeLabel: string;
  modePaiement: string;
  reference: string;
  numeroVente: string;
  venteId: number;
  vente: VenteMap;
}

@Component({
  selector: 'app-partenaires',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './partenaires.component.html',
  styleUrls: ['../clients/clients.component.scss', './partenaires.component.scss']
})
export class PartenairesComponent implements OnInit {
  clients: Client[] = [];
  selectedClient: Client | null = null;
  searchQuery: string = '';
  isLoading = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  get paginatedClients(): Client[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.clients.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.clients.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  isSaving = false;
  showFormModal = false;
  errorMessage = '';
  successMessage = '';

  // Propriétés pour les ventes par client
  ventesClient: VenteMap[] = [];
  ventesClientDivers: VenteMap[] = [];
  isLoadingVentes = false;
  showVentesModal = false;
  showVentesDiversModal = false;
  selectedClientForVentes: Client | null = null;

  // Filtres pour les ventes client
  filterVenteNumero: string = '';
  filterVenteType: string = '';
  filterVenteMois: string = '';
  ventesClientFiltered: VenteMap[] = [];

  // Filtres pour les ventes clients divers
  filterDiversNumero: string = '';
  filterDiversType: string = '';
  filterDiversDate: string = '';
  ventesClientDiversFiltered: VenteMap[] = [];

  // Modal détails vente
  design: DesignFacture = 1;
  showDetailModal: boolean = false;
  selectedVenteDetail: VenteMap | null = null;

  // ==================== HISTORIQUE PAIEMENTS ====================
  showHistoriquePaiementsModal: boolean = false;
  isLoadingHistorique: boolean = false;
  historiquePaiements: HistoriquePaiementEntry[] = [];
  clientPourHistorique: Client | null = null;

  // Filtres date pour historique ventes
  filterVenteDateDebut: string = '';
  filterVenteDateFin: string = '';

  // Filtres date pour historique paiements
  filterPaiementDateDebut: string = '';
  filterPaiementDateFin: string = '';
  historiquePaiementsFiltres: HistoriquePaiementEntry[] = [];
  viewModePaiement: 'simple' | 'groupe' = 'groupe';

  // ==================== AVANCES CLIENT ====================
  showAvanceModal: boolean = false;
  showHistoriqueAvancesModal: boolean = false;
  isLoadingAvance: boolean = false;
  clientPourAvance: Client | null = null;
  historiqueAvances: HistoriqueAvanceResponse | null = null;
  avanceForm: AvanceClientRequest = {
    clientNom: '',
    clientTelephone: '',
    montant: 0,
    motif: '',
    modePaiement: 'ESPECES',
    referencePaiement: ''
  };

  clientForm: Client = {
    nom: '',
    prenom: '',
    numeroTelephone: '',
    partenaire: true
  };

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private venteService: VenteService,
    private caisseService: CaisseService,
    private designService: FactureDesignService
  ) {}

  ngOnInit(): void {
    this.design = this.designService.getDesign();
    this.loadPartenaires();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadPartenaires(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.clientService.getPartenaires().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de charger les partenaires';
        this.isLoading = false;
      }
    });
  }

  searchClients(): void {
    if (!this.searchQuery.trim()) {
      this.loadPartenaires();
      return;
    }

    this.isLoading = true;
    this.clientService.search(this.searchQuery.trim()).subscribe({
      next: (clients) => {
        this.clients = clients.filter(c => c.partenaire === true);
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de rechercher les partenaires';
        this.isLoading = false;
      }
    });
  }

  editClient(client: Client): void {
    this.selectedClient = { ...client };
    this.clientForm = {
      id: client.id,
      nom: client.nom,
      prenom: client.prenom,
      numeroTelephone: client.numeroTelephone || client.telephone || '',
      adresse: client.adresse || '',
      email: client.email || '',
      partenaire: client.partenaire ?? true
    };
    this.errorMessage = '';
    this.successMessage = '';
    this.showFormModal = true;
  }

  resetForm(): void {
    this.selectedClient = null;
    this.clientForm = {
      nom: '',
      prenom: '',
      numeroTelephone: '',
      partenaire: true
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  openCreateModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  saveClient(): void {
    if (!this.clientForm.nom.trim() || !this.clientForm.prenom.trim()) {
      Swal.fire({ icon: 'warning', title: 'Champs requis', text: 'Le nom et le prénom sont obligatoires.', confirmButtonColor: '#f0ad4e' });
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const action = this.selectedClient && this.selectedClient.id
      ? this.clientService.update(this.selectedClient.id, this.clientForm)
      : this.clientService.create(this.clientForm);

    action.subscribe({
      next: () => {
        const msg = this.selectedClient ? 'Partenaire modifié avec succès.' : 'Partenaire créé avec succès.';
        this.showFormModal = false;
        this.resetForm();
        this.loadPartenaires();
        this.isSaving = false;
        Swal.fire({ icon: 'success', title: 'Succès', text: msg, timer: 2000, timerProgressBar: true, confirmButtonColor: '#198754' });
      },
      error: (error) => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message || 'Impossible de sauvegarder le partenaire', confirmButtonColor: '#dc3545' });
      }
    });
  }

  deleteClient(client: Client): void {
    if (!client.id) return;
    Swal.fire({
      title: 'Supprimer ce partenaire ?',
      html: `<b>${client.nom} ${client.prenom}</b> sera supprimé définitivement.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.isSaving = true;
      this.clientService.delete(client.id!).subscribe({
        next: () => {
          this.loadPartenaires();
          this.isSaving = false;
          Swal.fire({ icon: 'success', title: 'Supprimé', text: 'Partenaire supprimé.', timer: 1800, timerProgressBar: true, confirmButtonColor: '#198754' });
        },
        error: (error) => {
          this.isSaving = false;
          Swal.fire({ icon: 'error', title: 'Erreur', text: error.message || 'Impossible de supprimer le partenaire', confirmButtonColor: '#dc3545' });
        }
      });
    });
  }

  getFullName(client: Client): string {
    return this.clientService.getFullName(client);
  }

  // ==================== MÉTHODES POUR LES VENTES ====================

  showClientVentes(client: Client): void {
    this.selectedClientForVentes = client;
    this.isLoadingVentes = true;
    this.showVentesModal = true;
    this.errorMessage = '';

    this.filterVenteNumero = '';
    this.filterVenteType = '';
    this.filterVenteMois = '';

    this.venteService.getAllVentes().subscribe({
      next: (ventes) => {
        this.ventesClient = ventes.filter(vente => this.isVenteForClient(vente, client));
        this.ventesClient.sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime());
        this.ventesClientFiltered = [...this.ventesClient];
        this.isLoadingVentes = false;
        this.loadPaiementsForVentesModal(client);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de charger les ventes du partenaire';
        this.isLoadingVentes = false;
      }
    });
  }

  private isVenteForClient(vente: VenteMap, client: Client): boolean {
    if (client.id && vente.clientId && vente.clientId === client.id) {
      return true;
    }

    const clientPhone = this.normalizePhone(client.numeroTelephone || client.telephone || '');
    const ventePhone = this.normalizePhone(vente.clientTelephone || '');
    if (clientPhone && ventePhone && clientPhone === ventePhone) {
      return true;
    }

    const venteNom = this.normalizeText(vente.clientNom || '');
    const ventePrenom = this.normalizeText(vente.clientPrenom || '');
    const clientNom = this.normalizeText(client.nom || '');
    const clientPrenom = this.normalizeText(client.prenom || '');

    if (!venteNom || !clientNom || venteNom !== clientNom) {
      return false;
    }

    return !clientPrenom || !ventePrenom || ventePrenom === clientPrenom;
  }

  private normalizeText(value: string): string {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
  }

  private normalizePhone(value: string): string {
    return (value || '').replace(/\D/g, '');
  }

  filterVentesClient(): void {
    this.ventesClientFiltered = this.ventesClient.filter(vente => {
      if (this.filterVenteNumero && !vente.numeroVente.toLowerCase().includes(this.filterVenteNumero.toLowerCase())) {
        return false;
      }
      if (this.filterVenteType) {
        if (this.filterVenteType === 'COMPTANT' && vente.estCredit) return false;
        if (this.filterVenteType === 'CREDIT' && !vente.estCredit) return false;
        if (this.filterVenteType === 'CREDIT_EN_COURS' && (!vente.estCredit || vente.creditRegle || this.getMontantRestantCredit(vente) <= 0)) return false;
        if (this.filterVenteType === 'CREDIT_RETARD' && (!vente.estCredit || vente.creditRegle || !this.isCreditEnRetard(vente))) return false;
        if (this.filterVenteType === 'CREDIT_REGLE' && (!vente.estCredit || !vente.creditRegle)) return false;
      }
      if (this.filterVenteMois) {
        const venteDate = new Date(vente.dateVente);
        const venteMois = `${venteDate.getFullYear()}-${String(venteDate.getMonth() + 1).padStart(2, '0')}`;
        if (venteMois !== this.filterVenteMois) return false;
      }
      if (this.filterVenteDateDebut) {
        if (new Date(vente.dateVente) < new Date(this.filterVenteDateDebut)) return false;
      }
      if (this.filterVenteDateFin) {
        if (new Date(vente.dateVente) > new Date(this.filterVenteDateFin + 'T23:59:59')) return false;
      }
      return true;
    });
  }

  filterHistoriquePaiements(): void {
    this.historiquePaiementsFiltres = this.historiquePaiements.filter(p => {
      if (this.filterPaiementDateDebut && new Date(p.date) < new Date(this.filterPaiementDateDebut)) return false;
      if (this.filterPaiementDateFin && new Date(p.date) > new Date(this.filterPaiementDateFin + 'T23:59:59')) return false;
      return true;
    });
  }

  filterVentesDivers(): void {
    this.ventesClientDiversFiltered = this.ventesClientDivers.filter(vente => {
      if (this.filterDiversNumero && !vente.numeroVente.toLowerCase().includes(this.filterDiversNumero.toLowerCase())) {
        return false;
      }
      if (this.filterDiversType) {
        if (this.filterDiversType === 'COMPTANT' && vente.estCredit) return false;
        if (this.filterDiversType === 'CREDIT' && !vente.estCredit) return false;
        if (this.filterDiversType === 'CREDIT_EN_COURS' && (!vente.estCredit || vente.creditRegle || this.getMontantRestantCredit(vente) <= 0)) return false;
        if (this.filterDiversType === 'CREDIT_RETARD' && (!vente.estCredit || vente.creditRegle || !this.isCreditEnRetard(vente))) return false;
        if (this.filterDiversType === 'CREDIT_REGLE' && (!vente.estCredit || !vente.creditRegle)) return false;
      }
      if (this.filterDiversDate) {
        const venteDate = new Date(vente.dateVente).toISOString().split('T')[0];
        if (venteDate !== this.filterDiversDate) return false;
      }
      return true;
    });
  }

  resetVentesFilters(): void {
    this.filterVenteNumero = '';
    this.filterVenteType = '';
    this.filterVenteMois = '';
    this.filterVenteDateDebut = '';
    this.filterVenteDateFin = '';
    this.ventesClientFiltered = [...this.ventesClient];
  }

  resetDiversFilters(): void {
    this.filterDiversNumero = '';
    this.filterDiversType = '';
    this.filterDiversDate = '';
    this.ventesClientDiversFiltered = [...this.ventesClientDivers];
  }

  showVenteDetail(vente: VenteMap): void {
    this.selectedVenteDetail = vente;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedVenteDetail = null;
  }

  closeVentesModal(): void {
    this.showVentesModal = false;
    this.ventesClient = [];
    this.ventesClientFiltered = [];
    this.selectedClientForVentes = null;
  }

  closeVentesDiversModal(): void {
    this.showVentesDiversModal = false;
    this.ventesClientDivers = [];
    this.ventesClientDiversFiltered = [];
  }

  // ==================== MÉTHODES D'EXPORT PDF ====================

  exportAllVentesDetailToPDF(): void {
    if (this.ventesClientFiltered.length === 0) {
      this.errorMessage = 'Aucune vente à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      const client = this.selectedClientForVentes;
      this.venteService.exportVentesClientDetailToPDF(
        this.ventesClientFiltered,
        client?.nom || '',
        client?.prenom || ''
      );
      this.successMessage = 'Export PDF détaillé lancé avec succès';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || "Erreur lors de l'export PDF";
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  exportCreditClientDetailToPDF(): void {
    const credit = this.ventesClientFiltered.filter(v => v.estCredit);
    if (credit.length === 0) {
      this.errorMessage = 'Aucune vente crédit à exporter pour ce partenaire';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportVentesCreditDetailToPDF(credit);
      this.successMessage = 'Export PDF des crédits partenaire lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || "Erreur lors de l'export PDF";
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  // ==================== MÉTHODES DE FORMATAGE ====================

  formatPrice(price: number): string {
    return this.venteService.formatPrice(price);
  }

  formatDateComplete(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  formatHeure(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }

  formatDateLong(dateString: string): string {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch { return dateString; }
  }

  getRelativeDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Aujourd'hui";
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Hier';
    } else {
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7 && diffDays > 0) {
        return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      }
      return '';
    }
  }

  getModePaiementLabel(mode: string): string {
    return this.venteService.getModePaiementLabel(mode);
  }

  getModePaiementIcon(mode: string): string {
    const icons: Record<string, string> = {
      'ESPECES': 'fa fa-money',
      'ORANGE_MONEY': 'fa fa-mobile',
      'MOOV_MONEY': 'fa fa-mobile',
      'CARTE_BANCAIRE': 'fa fa-credit-card',
      'VIREMENT': 'fa fa-university'
    };
    return icons[String(mode)] || 'fa fa-credit-card';
  }

  getVenteTypeBadgeClass(vente: VenteMap): string {
    if (!vente.estCredit) return 'badge-success';
    if (vente.creditRegle) return 'badge-info';
    if (this.isCreditEnRetard(vente)) return 'badge-danger';
    return 'badge-warning';
  }

  getVenteTypeLabel(vente: VenteMap): string {
    if (!vente.estCredit) return 'COMPTANT';
    if (vente.creditRegle) return 'CRÉDIT RÉGLÉ';
    if (this.isCreditEnRetard(vente)) return 'CRÉDIT RETARD';
    return 'CRÉDIT';
  }

  isCreditEnRetard(vente: VenteMap): boolean {
    if (!vente.estCredit || !vente.dateEcheance || vente.creditRegle) return false;
    const echeance = new Date(vente.dateEcheance);
    const aujourdhui = new Date();
    return echeance < aujourdhui;
  }

  getCreditStatusClass(vente: VenteMap): string {
    if (vente.creditRegle) return 'credit-paid';
    if (this.isCreditEnRetard(vente)) return 'credit-late';
    return 'credit-pending';
  }

  getCreditStatusText(vente: VenteMap): string {
    if (vente.creditRegle) return 'Réglé';
    if (this.isCreditEnRetard(vente)) {
      const echeance = new Date(vente.dateEcheance!);
      const jours = Math.ceil((new Date().getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24));
      return `En retard (${jours}j)`;
    }
    if (vente.dateEcheance) {
      const echeance = new Date(vente.dateEcheance);
      const jours = Math.ceil((echeance.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return `Échéance dans ${jours}j`;
    }
    return 'En attente';
  }

  getTotalVentes(ventes: VenteMap[]): number {
    return ventes.reduce((sum, v) => sum + v.montantTotal, 0);
  }

  get ventesCreditClient(): VenteMap[] {
    return this.ventesClient.filter(vente => vente.estCredit);
  }

  get creditsEnCoursClient(): VenteMap[] {
    return this.ventesClient
      .filter(vente => this.isCreditEnCours(vente))
      .sort((a, b) => new Date(a.dateEcheance || a.dateVente).getTime() - new Date(b.dateEcheance || b.dateVente).getTime());
  }

  get creditsReglesClient(): VenteMap[] {
    return this.ventesClient
      .filter(vente => vente.estCredit && vente.creditRegle)
      .sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime());
  }

  isCreditEnCours(vente: VenteMap): boolean {
    return vente.estCredit && !vente.creditRegle && this.getMontantRestantCredit(vente) > 0;
  }

  getMontantRestantCredit(vente: VenteMap): number {
    if (!vente.estCredit || vente.creditRegle) return 0;
    const montantRestant = vente.montantRestant ?? (vente.montantTotal - (vente.montantVerse || 0));
    return Math.max(0, montantRestant);
  }

  getTotalCreditsEnCoursClient(): number {
    return this.creditsEnCoursClient.reduce((sum, vente) => sum + vente.montantTotal, 0);
  }

  getTotalCreditsEnCoursRestantsClient(): number {
    return this.creditsEnCoursClient.reduce((sum, vente) => sum + this.getMontantRestantCredit(vente), 0);
  }

  getTotalCreditsEnCoursVersesClient(): number {
    return this.creditsEnCoursClient.reduce((sum, vente) => sum + (vente.montantVerse || 0), 0);
  }

  getProduitsCount(vente: VenteMap): number {
    return vente.produits?.length || 0;
  }

  getProduitsList(vente: VenteMap): string {
    if (!vente.produits || vente.produits.length === 0) return '-';
    return vente.produits.map(p => `${p.quantite}x ${p.produitNom || 'Produit'}`).join(', ');
  }

  telechargerFacture(venteId: number): void {
    this.venteService.telechargerFacture(venteId).subscribe({
      next: () => {
        this.successMessage = 'Facture générée avec succès';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de générer la facture';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ==================== HISTORIQUE PAIEMENTS ====================

  loadHistoriquePaiements(client: Client): void {
    this.clientPourHistorique = client;
    this.isLoadingHistorique = true;
    this.historiquePaiements = [];
    this.showHistoriquePaiementsModal = true;

    this.venteService.getAllVentes().subscribe({
      next: (ventes) => {
        const ventesClient = ventes.filter(v => this.isVenteForClient(v, client) && !v.annulee);
        const entries: HistoriquePaiementEntry[] = [];

        const comptant = ventesClient.filter(v => !v.estCredit);
        comptant.forEach(v => {
          entries.push({
            date: v.dateVente,
            montant: v.montantTotal,
            typeLabel: 'Comptant',
            modePaiement: v.modePaiement || '',
            reference: v.referencePaiement || '',
            numeroVente: v.numeroVente,
            venteId: v.id,
            vente: v
          });
        });

        const credits = ventesClient.filter(v => v.estCredit);
        if (credits.length === 0) {
          this.historiquePaiements = entries.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.historiquePaiementsFiltres = [...this.historiquePaiements];
          this.isLoadingHistorique = false;
          return;
        }

        const calls = credits.map(v => this.caisseService.getHistoriqueReglementsCredit(v.id));
        forkJoin(calls).subscribe({
          next: (results) => {
            results.forEach((reglements, i) => {
              const vente = credits[i];
              reglements.forEach(r => {
                entries.push({
                  date: r.dateOperation,
                  montant: r.montant,
                  typeLabel: 'Crédit',
                  modePaiement: (r.modePaiement as string) || '',
                  reference: r.referencePaiement || '',
                  numeroVente: vente.numeroVente,
                  venteId: vente.id,
                  vente: vente
                });
              });
            });
            this.historiquePaiements = entries.sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            this.historiquePaiementsFiltres = [...this.historiquePaiements];
            this.isLoadingHistorique = false;
          },
          error: () => { this.isLoadingHistorique = false; }
        });
      },
      error: () => { this.isLoadingHistorique = false; }
    });
  }

  private loadPaiementsForVentesModal(client: Client): void {
    this.isLoadingHistorique = true;
    this.historiquePaiements = [];
    this.historiquePaiementsFiltres = [];
    this.clientPourHistorique = client;

    this.venteService.getAllVentes().subscribe({
      next: (ventes) => {
        const ventesClient = ventes.filter(v => this.isVenteForClient(v, client) && !v.annulee);
        const entries: HistoriquePaiementEntry[] = [];

        const comptant = ventesClient.filter(v => !v.estCredit);
        comptant.forEach(v => {
          entries.push({
            date: v.dateVente,
            montant: v.montantTotal,
            typeLabel: 'Comptant',
            modePaiement: v.modePaiement || '',
            reference: v.referencePaiement || '',
            numeroVente: v.numeroVente,
            venteId: v.id,
            vente: v
          });
        });

        const credits = ventesClient.filter(v => v.estCredit);
        if (credits.length === 0) {
          this.historiquePaiements = entries.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.historiquePaiementsFiltres = [...this.historiquePaiements];
          this.isLoadingHistorique = false;
          return;
        }

        const calls = credits.map(v => this.caisseService.getHistoriqueReglementsCredit(v.id));
        forkJoin(calls).subscribe({
          next: (results) => {
            results.forEach((reglements, i) => {
              const vente = credits[i];
              reglements.forEach(r => {
                entries.push({
                  date: r.dateOperation,
                  montant: r.montant,
                  typeLabel: 'Crédit',
                  modePaiement: (r.modePaiement as string) || '',
                  reference: r.referencePaiement || '',
                  numeroVente: vente.numeroVente,
                  venteId: vente.id,
                  vente: vente
                });
              });
            });
            this.historiquePaiements = entries.sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            this.historiquePaiementsFiltres = [...this.historiquePaiements];
            this.isLoadingHistorique = false;
          },
          error: () => { this.isLoadingHistorique = false; }
        });
      },
      error: () => { this.isLoadingHistorique = false; }
    });
  }

  closeHistoriquePaiementsModal(): void {
    this.showHistoriquePaiementsModal = false;
    this.historiquePaiements = [];
    this.historiquePaiementsFiltres = [];
    this.clientPourHistorique = null;
    this.filterPaiementDateDebut = '';
    this.filterPaiementDateFin = '';
    this.viewModePaiement = 'groupe';
  }

  getTotalHistorique(): number {
    return this.historiquePaiements.reduce((sum, r) => sum + (r.montant || 0), 0);
  }

  get totalHistoriqueFiltres(): number {
    return this.historiquePaiementsFiltres.reduce((sum, r) => sum + (r.montant || 0), 0);
  }

  get historiquePaiementsGroupes(): { date: string; entries: HistoriquePaiementEntry[]; total: number }[] {
    const groups: { [key: string]: HistoriquePaiementEntry[] } = {};
    this.historiquePaiementsFiltres.forEach(p => {
      const key = new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.entries(groups).map(([date, entries]) => ({
      date,
      entries,
      total: entries.reduce((s, e) => s + e.montant, 0)
    }));
  }

  voirVenteDepuisHistorique(entry: HistoriquePaiementEntry): void {
    this.selectedVenteDetail = entry.vente;
    this.showDetailModal = true;
  }

  imprimerFactureHistorique(entry: HistoriquePaiementEntry): void {
    this.venteService.imprimerFacture(entry.vente);
  }

  // ==================== AVANCES CLIENT ====================

  openAvanceModal(client: Client): void {
    this.clientPourAvance = client;
    const nom = client.nom;
    const tel = client.telephone || client.numeroTelephone || '';
    this.avanceForm = {
      clientNom: nom,
      clientTelephone: tel,
      montant: 0,
      motif: '',
      modePaiement: 'ESPECES',
      referencePaiement: ''
    };
    this.showAvanceModal = true;
  }

  closeAvanceModal(): void {
    this.showAvanceModal = false;
    this.clientPourAvance = null;
  }

  enregistrerAvance(): void {
    if (!this.avanceForm.montant || this.avanceForm.montant <= 0) {
      Swal.fire({ icon: 'warning', title: 'Montant invalide', text: 'Le montant doit être supérieur à 0', confirmButtonColor: '#2a63ff' });
      return;
    }
    if (this.avanceForm.modePaiement !== 'ESPECES' && !this.avanceForm.referencePaiement) {
      Swal.fire({ icon: 'warning', title: 'Référence manquante', text: 'Saisissez une référence de paiement', confirmButtonColor: '#2a63ff' });
      return;
    }
    this.isLoadingAvance = true;
    const request: AvanceClientRequest = {
      ...this.avanceForm,
      utilisateurId: this.authService.getUser()?.id
    };
    this.clientService.enregistrerAvance(request).subscribe({
      next: (res) => {
        this.isLoadingAvance = false;
        this.closeAvanceModal();
        Swal.fire({ icon: 'success', title: 'Avance enregistrée', text: res.message, timer: 2500, confirmButtonColor: '#198754' });
      },
      error: (err) => {
        this.isLoadingAvance = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err.message, confirmButtonColor: '#d33' });
      }
    });
  }

  openHistoriqueAvancesModal(client: Client): void {
    this.clientPourAvance = client;
    const nom = client.nom;
    const tel = client.telephone || client.numeroTelephone || '';
    this.isLoadingAvance = true;
    this.showHistoriqueAvancesModal = true;
    this.clientService.getHistoriqueAvances(nom, tel).subscribe({
      next: (res) => {
        this.historiqueAvances = res;
        this.isLoadingAvance = false;
      },
      error: (err) => {
        this.isLoadingAvance = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err.message, confirmButtonColor: '#d33' });
      }
    });
  }

  closeHistoriqueAvancesModal(): void {
    this.showHistoriqueAvancesModal = false;
    this.historiqueAvances = null;
    this.clientPourAvance = null;
  }

  getStatutAvanceBadge(statut: string): string {
    switch (statut) {
      case 'DISPONIBLE': return 'badge bg-success';
      case 'UTILISE_PARTIELLEMENT': return 'badge bg-warning text-dark';
      case 'EPUISE': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  getStatutAvanceLabel(statut: string): string {
    switch (statut) {
      case 'DISPONIBLE': return 'Disponible';
      case 'UTILISE_PARTIELLEMENT': return 'Partiel';
      case 'EPUISE': return 'Épuisé';
      default: return statut;
    }
  }
}
