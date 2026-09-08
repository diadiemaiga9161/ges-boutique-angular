// src/app/views/pages/clients/clients.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService, Client, AvanceClient, AvanceClientRequest, HistoriqueAvanceResponse } from '../../../shared/services/client.service';
import { AuthService } from '../../../shared/services/auth.service';
import { VenteService, VenteMap, ReleveClientLigne, ReleveClientResponse } from '../../../shared/services/vente.service';
import { CaisseService } from '../../../shared/services/caisse.service';
import { DesignFacture, FactureDesignService } from '../../../shared/services/facture-design.service';
import { FactureService } from '../../../shared/services/facture.service';
import { ProductService } from '../../../shared/services/product.service';
import { BoutiqueService } from '../../../shared/services/boutique.service';
import { FideliteService, SoldeFidelite, MouvementFidelite } from '../../../shared/services/fidelite.service';
import { formaterMessageWhatsApp, envoyerWhatsAppDirect } from '../../../shared/utils/whatsapp.util';
import { forkJoin, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MontantInputDirective } from '../../../shared/directives/montant-input.directive';

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

type SituationTypeFilter = '' | 'VENTE' | 'VERSEMENT';

/** Ligne de situation client, éventuellement le résultat du regroupement de plusieurs
 *  opérations de même type sur une même date (nbOperations > 1 dans ce cas). */
interface LigneSituationAffichee extends ReleveClientLigne {
  nbOperations?: number;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MontantInputDirective],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
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

  get totalAvanceDisponible(): number {
    return this.clients.reduce((sum, c) => sum + (c.soldeAvance || 0), 0);
  }

  get nombreClientsAvecAvance(): number {
    return this.clients.filter(c => (c.soldeAvance || 0) > 0).length;
  }

  get nombreClientsAvecEmail(): number {
    return this.clients.filter(c => !!c.email).length;
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
  // Onglets de la modale unique Ventes/Situation/Paiements/Avances (fusionnées pour
  // réduire le nombre de boutons/fenêtres séparées côté client — demande explicite :
  // "mettre situation dans la partie historique de vente ... comme des fonctions tabs
  // pour ne pas mettre trop d'infos", puis "tu mets paiement avance et historique dedans
  // pour ne pas avoir beaucoup de bouton").
  clientDetailTab: 'historique' | 'situation' | 'paiements' | 'avances' | 'fidelite' = 'historique';

  get clientDetailTitle(): string {
    switch (this.clientDetailTab) {
      case 'situation': return 'Situation client';
      case 'paiements': return 'Paiements';
      case 'avances': return 'Avances';
      case 'fidelite': return this.translate.instant('FIDELITE.TAB_LABEL');
      default: return 'Historique des ventes';
    }
  }

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
  historiquePaiementsFiltres: HistoriquePaiementEntry[] = [];
  clientPourHistorique: Client | null = null;
  filterPaiementDateDebut: string = '';
  filterPaiementDateFin: string = '';
  viewModePaiement: 'simple' | 'groupe' = 'groupe';

  // ==================== SITUATION CLIENT (relevé paginé) ====================
  showSituationClientModal: boolean = false;
  isLoadingSituation: boolean = false;
  clientPourSituation: Client | null = null;
  releveClient: ReleveClientResponse | null = null;
  situationLignes: LigneSituationAffichee[] = [];
  situationPreset: 'jour' | 'hier' | 'semaine' | 'mois' | 'annee' | 'personnalise' | 'tout' = 'tout';
  situationDateDebut: string = '';
  situationDateFin: string = '';
  situationTypeFilter: SituationTypeFilter = '';
  situationPage: number = 0;
  situationSize: number = 20;

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
    partenaire: false
  };

  // ==================== PROGRAMME DE FIDÉLITÉ ====================
  // Masqué entièrement si CleFonctionnalite.PROGRAMME_FIDELITE est désactivée (voir
  // BoutiqueService.fonctionnalitesAvancees$, même mécanisme que Dépôt garde / Comptes
  // bancaires — voir NavigationService).
  fideliteActif: boolean = false;
  isLoadingFidelite: boolean = false;
  soldeFideliteClient: SoldeFidelite | null = null;
  mouvementsFidelite: MouvementFidelite[] = [];
  showAjustementFideliteForm: boolean = false;
  isSavingAjustementFidelite: boolean = false;
  ajustementFideliteForm: { delta: number; motif: string } = { delta: 0, motif: '' };

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private venteService: VenteService,
    private caisseService: CaisseService,
    private designService: FactureDesignService,
    private factureService: FactureService,
    private productService: ProductService,
    private boutiqueService: BoutiqueService,
    private fideliteService: FideliteService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.design = this.designService.getDesign();
    this.loadClients();
    this.boutiqueService.fonctionnalitesAvancees$.subscribe(liste => {
      this.fideliteActif = liste.find(f => f.cle === 'PROGRAMME_FIDELITE')?.actif === true;
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadClients(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de charger les clients';
        this.isLoading = false;
      }
    });
  }

  searchClients(): void {
    if (!this.searchQuery.trim()) {
      this.loadClients();
      return;
    }

    this.isLoading = true;
    this.clientService.search(this.searchQuery.trim()).subscribe({
      next: (clients) => {
        this.clients = clients;
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de rechercher les clients';
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
      partenaire: client.partenaire ?? false
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
      partenaire: false
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
        const msg = this.selectedClient ? 'Client modifié avec succès.' : 'Client créé avec succès.';
        this.showFormModal = false;
        this.resetForm();
        this.loadClients();
        this.isSaving = false;
        Swal.fire({ icon: 'success', title: 'Succès', text: msg, timer: 2000, timerProgressBar: true, confirmButtonColor: '#198754' });
      },
      error: (error) => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message || 'Impossible de sauvegarder le client', confirmButtonColor: '#dc3545' });
      }
    });
  }

  deleteClient(client: Client): void {
    if (!client.id) return;
    Swal.fire({
      title: 'Supprimer ce client ?',
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
          this.loadClients();
          this.isSaving = false;
          Swal.fire({ icon: 'success', title: 'Supprimé', text: 'Client supprimé.', timer: 1800, timerProgressBar: true, confirmButtonColor: '#198754' });
        },
        error: (error) => {
          this.isSaving = false;
          Swal.fire({ icon: 'error', title: 'Erreur', text: error.message || 'Impossible de supprimer le client', confirmButtonColor: '#dc3545' });
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
    this.clientDetailTab = 'historique';
    this.isLoadingVentes = true;
    this.showVentesModal = true;
    this.errorMessage = '';

    this.filterVenteNumero = '';
    this.filterVenteType = '';
    this.filterVenteMois = '';

    // Réinitialise la fidélité pour ne jamais afficher les données du client
    // précédemment consulté (rechargée à la demande, voir switchClientDetailTab).
    this.soldeFideliteClient = null;
    this.mouvementsFidelite = [];

    this.venteService.getAllVentes().subscribe({
      next: (ventes) => {
        this.ventesClient = ventes.filter(vente => this.isVenteForClient(vente, client));
        this.ventesClient.sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime());
        this.ventesClientFiltered = [...this.ventesClient];
        this.isLoadingVentes = false;
        this.loadPaiementsForVentesModal(client);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de charger les ventes du client';
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
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private normalizePhone(value: string): string {
    return (value || '').replace(/\D/g, '');
  }

  showClientDiversVentes(): void {
    this.isLoadingVentes = true;
    this.showVentesDiversModal = true;
    this.errorMessage = '';
    
    this.filterDiversNumero = '';
    this.filterDiversType = '';
    this.filterDiversDate = '';

    this.venteService.getAllVentes().subscribe({
      next: (ventes) => {
        this.ventesClientDivers = ventes.filter(vente => 
          vente.clientDivers === true || 
          vente.clientNom === 'Client divers' ||
          (vente.clientNom && vente.clientNom.toLowerCase().includes('divers'))
        );
        this.ventesClientDivers.sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime());
        this.ventesClientDiversFiltered = [...this.ventesClientDivers];
        this.isLoadingVentes = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de charger les ventes des clients divers';
        this.isLoadingVentes = false;
      }
    });
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
    // Réinitialise aussi les onglets Situation/Paiements/Avances (fusionnés dans cette
    // même modale).
    this.clientDetailTab = 'historique';
    this.clientPourSituation = null;
    this.releveClient = null;
    this.situationLignes = [];
    this.historiqueAvances = null;
    this.clientPourAvance = null;
  }

  closeVentesDiversModal(): void {
    this.showVentesDiversModal = false;
    this.ventesClientDivers = [];
    this.ventesClientDiversFiltered = [];
  }

  // ==================== MÉTHODES D'EXPORT PDF ====================

  /**
   * Exporter toutes les ventes du client en PDF
   */
  exportAllVentesToPDF(): void {
    if (this.ventesClientFiltered.length === 0) {
      this.errorMessage = 'Aucune vente à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      const nomClient = `${this.selectedClientForVentes?.nom}_${this.selectedClientForVentes?.prenom}`;
      this.venteService.exportVentesToPDF(this.ventesClientFiltered, `VENTES_${nomClient}`);
      this.successMessage = 'Export PDF lancé avec succès';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  /**
   * Exporter les ventes comptant du client en PDF
   */
  exportComptantToPDF(): void {
    const comptant = this.ventesClientFiltered.filter(v => !v.estCredit);
    if (comptant.length === 0) {
      this.errorMessage = 'Aucune vente comptant à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      const nomClient = `${this.selectedClientForVentes?.nom}_${this.selectedClientForVentes?.prenom}`;
      this.venteService.exportVentesToPDF(comptant, `VENTES_COMPTANT_${nomClient}`);
      this.successMessage = 'Export PDF des ventes comptant lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  /**
   * Exporter les ventes crédit du client en PDF
   */
  exportCreditToPDF(): void {
    const credit = this.ventesClientFiltered.filter(v => v.estCredit);
    if (credit.length === 0) {
      this.errorMessage = 'Aucune vente crédit à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      const nomClient = `${this.selectedClientForVentes?.nom}_${this.selectedClientForVentes?.prenom}`;
      this.venteService.exportVentesToPDF(credit, `VENTES_CREDIT_${nomClient}`);
      this.successMessage = 'Export PDF des ventes crédit lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  /**
   * Exporter toutes les ventes clients divers en PDF
   */
  exportDiversAllToPDF(): void {
    if (this.ventesClientDiversFiltered.length === 0) {
      this.errorMessage = 'Aucune vente à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportVentesToPDF(this.ventesClientDiversFiltered, 'VENTES_CLIENTS_DIVERS');
      this.successMessage = 'Export PDF des clients divers lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  /**
   * Exporter les ventes comptant des clients divers en PDF
   */
  exportDiversComptantToPDF(): void {
    const comptant = this.ventesClientDiversFiltered.filter(v => !v.estCredit);
    if (comptant.length === 0) {
      this.errorMessage = 'Aucune vente comptant à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportVentesToPDF(comptant, 'VENTES_COMPTANT_CLIENTS_DIVERS');
      this.successMessage = 'Export PDF des ventes comptant clients divers lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  /**
   * Exporter les ventes crédit des clients divers en PDF
   */
  exportDiversCreditToPDF(): void {
    const credit = this.ventesClientDiversFiltered.filter(v => v.estCredit);
    if (credit.length === 0) {
      this.errorMessage = 'Aucune vente crédit à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportVentesToPDF(credit, 'VENTES_CREDIT_CLIENTS_DIVERS');
      this.successMessage = 'Export PDF des ventes crédit clients divers lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  // ==================== MÉTHODES DE FORMATAGE ====================

  formatPrice(price: number): string {
    return this.venteService.formatPrice(price);
  }

  formatDate(dateString: string): string {
    return this.venteService.formatDate(dateString);
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
      return "Hier";
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

  getTotalCreditsClient(): number {
    return this.ventesCreditClient.reduce((sum, vente) => sum + vente.montantTotal, 0);
  }

  getTotalCreditsRestantsClient(): number {
    return this.ventesCreditClient.reduce(
      (sum, vente) => sum + (!vente.creditRegle ? (vente.montantRestant ?? vente.montantTotal) : 0),
      0
    );
  }

  getTotalCreditsVersesClient(): number {
    return this.ventesCreditClient.reduce((sum, vente) => sum + (vente.montantVerse || 0), 0);
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


  // ==================== EXPORTS PDF DÉTAILLÉS ====================

  /**
   * Exporter toutes les ventes du client avec détails (PDF)
   */
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
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  /**
   * Exporter les ventes crédit du client avec détails (PDF)
   */
  exportCreditClientDetailToPDF(): void {
    const credit = this.ventesClientFiltered.filter(v => v.estCredit);
    if (credit.length === 0) {
      this.errorMessage = 'Aucune vente crédit à exporter pour ce client';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      const client = this.selectedClientForVentes;
      this.venteService.exportVentesCreditDetailToPDF(credit);
      this.successMessage = 'Export PDF des crédits client lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  /**
   * Exporter toutes les ventes clients divers avec détails (PDF)
   */
  exportDiversAllDetailToPDF(): void {
    if (this.ventesClientDiversFiltered.length === 0) {
      this.errorMessage = 'Aucune vente client divers à exporter';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportVentesClientDiversDetailToPDF(this.ventesClientDiversFiltered);
      this.successMessage = 'Export PDF des clients divers lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  /**
   * Exporter les crédits en retard des clients divers avec détails (PDF)
   */
  exportDiversCreditsRetardDetailToPDF(): void {
    const creditsRetard = this.ventesClientDiversFiltered.filter(v => v.estCredit && !v.creditRegle && this.isCreditEnRetard(v));
    if (creditsRetard.length === 0) {
      this.errorMessage = 'Aucun crédit en retard chez les clients divers';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    try {
      this.venteService.exportCreditsRetardDetailToPDF(creditsRetard);
      this.successMessage = 'Export PDF des crédits en retard lancé';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erreur lors de l\'export PDF';
      setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  // ==================== HISTORIQUE PAIEMENTS ====================

  // Fusionné dans la modale unique (onglet "Paiements") au lieu d'une fenêtre séparée —
  // réutilise loadPaiementsForVentesModal (même logique qu'avant, plus de duplication).
  loadHistoriquePaiements(client: Client): void {
    this.selectedClientForVentes = client;
    this.clientDetailTab = 'paiements';
    this.showVentesModal = true;
    this.ventesClient = [];
    this.ventesClientFiltered = [];
    this.isLoadingVentes = true;
    this.venteService.getAllVentes().subscribe({
      next: (ventes) => {
        this.ventesClient = ventes.filter(vente => this.isVenteForClient(vente, client));
        this.ventesClient.sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime());
        this.ventesClientFiltered = [...this.ventesClient];
        this.isLoadingVentes = false;
        this.loadPaiementsForVentesModal(client);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de charger les ventes du client';
        this.isLoadingVentes = false;
      }
    });
  }

  closeHistoriquePaiementsModal(): void {
    this.showHistoriquePaiementsModal = false;
    this.historiquePaiements = [];
    this.historiquePaiementsFiltres = [];
    this.clientPourHistorique = null;
    this.filterPaiementDateDebut = '';
    this.filterPaiementDateFin = '';
  }

  filterHistoriquePaiements(): void {
    this.historiquePaiementsFiltres = this.historiquePaiements.filter(p => {
      if (this.filterPaiementDateDebut && new Date(p.date) < new Date(this.filterPaiementDateDebut)) return false;
      if (this.filterPaiementDateFin && new Date(p.date) > new Date(this.filterPaiementDateFin + 'T23:59:59')) return false;
      return true;
    });
  }

  resetFiltresPaiements(): void {
    this.filterPaiementDateDebut = '';
    this.filterPaiementDateFin = '';
    this.historiquePaiementsFiltres = [...this.historiquePaiements];
  }

  get totalHistoriqueFiltres(): number {
    return this.historiquePaiementsFiltres.reduce((sum, r) => sum + (r.montant || 0), 0);
  }

  get historiquePaiementsGroupes(): { date: string; entries: HistoriquePaiementEntry[]; total: number }[] {
    const groups: { [key: string]: HistoriquePaiementEntry[] } = {};
    this.historiquePaiementsFiltres.forEach(p => {
      const key = new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.entries(groups).map(([date, entries]) => ({
      date,
      entries,
      total: entries.reduce((s, e) => s + e.montant, 0)
    }));
  }

  getTotalHistorique(): number {
    return this.historiquePaiements.reduce((sum, r) => sum + (r.montant || 0), 0);
  }

  voirVenteDepuisHistorique(entry: HistoriquePaiementEntry): void {
    this.selectedVenteDetail = entry.vente;
    this.showDetailModal = true;
  }

  imprimerListeClients(): void {
    if (!this.clients.length) {
      Swal.fire({ icon: 'info', title: 'Aucun client', text: 'La liste de clients est vide.' });
      return;
    }
    const lignes = this.clients.map(c => [
      `${c.nom} ${c.prenom || ''}`.trim(),
      c.numeroTelephone || c.telephone || '—',
      c.adresse || '—',
      c.email || '—',
      c.soldeAvance ? this.formatPrice(c.soldeAvance) : '—'
    ]);

    this.factureService.ouvrirDocumentPDF({
      titre: 'Liste des clients',
      sousTitre: `${this.clients.length} client(s)`,
      colonnes: ['Nom', 'Téléphone', 'Adresse', 'Email', 'Avance'],
      lignes,
      pied: `Généré depuis la liste des clients — ${this.clients.length} client(s)`,
      paysage: true
    });
  }

  imprimerFactureHistorique(entry: HistoriquePaiementEntry): void {
    this.venteService.imprimerFacture(entry.vente);
  }

  // ==================== SITUATION CLIENT (relevé paginé) ====================

  loadSituationClient(client: Client): void {
    if (!client.id) {
      Swal.fire({ icon: 'warning', title: 'Client sans identifiant', text: 'Impossible de charger la situation de ce client.' });
      return;
    }
    // Fusionnée dans la modale Historique des ventes (onglet "Situation") au lieu d'une
    // fenêtre séparée — on ouvre/réutilise donc showVentesModal, pas showSituationClientModal.
    this.selectedClientForVentes = client;
    this.clientPourSituation = client;
    this.clientDetailTab = 'situation';
    this.showVentesModal = true;
    this.releveClient = null;
    this.situationLignes = [];
    this.situationPreset = 'tout';
    this.situationDateDebut = '';
    this.situationDateFin = '';
    this.situationTypeFilter = '';
    this.situationPage = 0;
    this.fetchReleveClient();

    // Charge aussi l'onglet Historique en arrière-plan pour que le basculement d'onglet
    // soit instantané (pas d'attente au clic sur "Historique des ventes").
    if (this.ventesClient.length === 0 || this.selectedClientForVentes !== client) {
      this.isLoadingVentes = true;
      this.venteService.getAllVentes().subscribe({
        next: (ventes) => {
          this.ventesClient = ventes.filter(vente => this.isVenteForClient(vente, client));
          this.ventesClient.sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime());
          this.ventesClientFiltered = [...this.ventesClient];
          this.isLoadingVentes = false;
          this.loadPaiementsForVentesModal(client);
        },
        error: () => { this.isLoadingVentes = false; }
      });
    }
  }

  /** Bascule entre les onglets de la modale unique (Historique des ventes / Situation
   *  du compte / Paiements / Avances / Fidélité), en chargeant les données à la demande
   *  si pas encore fait — les onglets Historique et Paiements partagent déjà les mêmes
   *  données (chargées ensemble par loadPaiementsForVentesModal). */
  switchClientDetailTab(tab: 'historique' | 'situation' | 'paiements' | 'avances' | 'fidelite'): void {
    this.clientDetailTab = tab;
    if (tab === 'situation' && !this.releveClient && this.selectedClientForVentes) {
      this.clientPourSituation = this.selectedClientForVentes;
      this.fetchReleveClient();
    }
    if (tab === 'avances' && !this.historiqueAvances && !this.isLoadingAvance && this.selectedClientForVentes) {
      this.chargerHistoriqueAvancesPourOnglet(this.selectedClientForVentes);
    }
    if (tab === 'fidelite' && !this.soldeFideliteClient && !this.isLoadingFidelite && this.selectedClientForVentes) {
      this.chargerFideliteClient(this.selectedClientForVentes);
    }
  }

  // ==================== PROGRAMME DE FIDÉLITÉ (fiche client) ====================

  private chargerFideliteClient(client: Client): void {
    if (!client.id) return;
    this.isLoadingFidelite = true;
    this.soldeFideliteClient = null;
    this.mouvementsFidelite = [];
    forkJoin({
      solde: this.fideliteService.getSoldeClient(client.id),
      mouvements: this.fideliteService.getMouvementsClient(client.id)
    }).subscribe({
      next: ({ solde, mouvements }) => {
        this.soldeFideliteClient = solde;
        this.mouvementsFidelite = (mouvements || []).sort((a, b) =>
          new Date(b.dateMouvement).getTime() - new Date(a.dateMouvement).getTime()
        );
        this.isLoadingFidelite = false;
      },
      error: () => { this.isLoadingFidelite = false; }
    });
  }

  getMouvementFideliteLabel(type: string): string {
    switch (type) {
      case 'GAGNE': return this.translate.instant('FIDELITE.MOVEMENT_GAGNE');
      case 'UTILISE': return this.translate.instant('FIDELITE.MOVEMENT_UTILISE');
      case 'AJUSTEMENT': return this.translate.instant('FIDELITE.MOVEMENT_AJUSTEMENT');
      default: return type;
    }
  }

  getMouvementFideliteBadge(type: string): string {
    switch (type) {
      case 'GAGNE': return 'badge bg-success';
      case 'UTILISE': return 'badge bg-danger';
      case 'AJUSTEMENT': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  // Réservé à ADMIN — le serveur revérifie systématiquement le privilège (403 sinon).
  ouvrirAjustementFidelite(): void {
    this.ajustementFideliteForm = { delta: 0, motif: '' };
    this.showAjustementFideliteForm = true;
  }

  fermerAjustementFidelite(): void {
    this.showAjustementFideliteForm = false;
  }

  confirmerAjustementFidelite(): void {
    if (!this.selectedClientForVentes?.id) return;
    if (!this.ajustementFideliteForm.delta) {
      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('FIDELITE.ADJUST_DELTA_REQUIRED'),
        confirmButtonColor: '#f0ad4e'
      });
      return;
    }

    this.isSavingAjustementFidelite = true;
    this.fideliteService.ajusterSolde(
      this.selectedClientForVentes.id,
      this.ajustementFideliteForm.delta,
      this.ajustementFideliteForm.motif
    ).subscribe({
      next: () => {
        this.isSavingAjustementFidelite = false;
        this.showAjustementFideliteForm = false;
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('FIDELITE.ADJUST_SUCCESS'),
          timer: 2000,
          timerProgressBar: true,
          confirmButtonColor: '#198754'
        });
        this.chargerFideliteClient(this.selectedClientForVentes!);
      },
      error: (err: Error) => {
        this.isSavingAjustementFidelite = false;
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('FIDELITE.ADJUST_ERROR'),
          text: err.message,
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  private chargerHistoriqueAvancesPourOnglet(client: Client): void {
    this.clientPourAvance = client;
    const nom = client.nom;
    const tel = client.telephone || client.numeroTelephone || '';
    this.isLoadingAvance = true;
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

  private fetchReleveClient(): void {
    if (!this.clientPourSituation?.id) return;
    this.isLoadingSituation = true;
    this.venteService.getReleveClient(
      this.clientPourSituation.id,
      this.situationPage,
      this.situationSize,
      this.situationDateDebut || undefined,
      this.situationDateFin || undefined,
      this.situationTypeFilter || undefined
    ).subscribe({
      next: (res) => {
        this.releveClient = res;
        this.situationLignes = this.grouperLignesParDate(res.lignes || []);
        this.isLoadingSituation = false;
      },
      error: () => {
        this.isLoadingSituation = false;
      }
    });
  }

  closeSituationClientModal(): void {
    this.showSituationClientModal = false;
    this.clientPourSituation = null;
    this.releveClient = null;
    this.situationLignes = [];
  }

  appliquerSituationPreset(preset: 'jour' | 'hier' | 'semaine' | 'mois' | 'annee' | 'personnalise' | 'tout'): void {
    this.situationPreset = preset;
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'tout') {
      this.situationDateDebut = '';
      this.situationDateFin = '';
    } else if (preset === 'jour') {
      this.situationDateDebut = fmt(today);
      this.situationDateFin = fmt(today);
    } else if (preset === 'hier') {
      const hier = new Date(today);
      hier.setDate(today.getDate() - 1);
      this.situationDateDebut = fmt(hier);
      this.situationDateFin = fmt(hier);
    } else if (preset === 'semaine') {
      const jour = (today.getDay() + 6) % 7; // lundi = 0
      const debut = new Date(today);
      debut.setDate(today.getDate() - jour);
      this.situationDateDebut = fmt(debut);
      this.situationDateFin = fmt(today);
    } else if (preset === 'mois') {
      this.situationDateDebut = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
      this.situationDateFin = fmt(today);
    } else if (preset === 'annee') {
      this.situationDateDebut = fmt(new Date(today.getFullYear(), 0, 1));
      this.situationDateFin = fmt(today);
    }

    if (preset !== 'personnalise') {
      this.situationPage = 0;
      this.fetchReleveClient();
    }
  }

  applySituationFilter(): void {
    this.situationPage = 0;
    this.fetchReleveClient();
  }

  appliquerSituationTypeFilter(type: SituationTypeFilter): void {
    this.situationTypeFilter = type;
    this.situationPage = 0;
    this.fetchReleveClient();
  }

  situationPagePrecedente(): void {
    if (this.situationPage <= 0) return;
    this.situationPage--;
    this.fetchReleveClient();
  }

  situationPageSuivante(): void {
    if (!this.releveClient || this.situationPage >= this.releveClient.totalPages - 1) return;
    this.situationPage++;
    this.fetchReleveClient();
  }

  get totalVentesSituation(): number {
    return this.releveClient?.totalVentes || 0;
  }

  get totalVersementsSituation(): number {
    return this.releveClient?.totalVersements || 0;
  }

  get resteAPayerSituation(): number {
    return this.releveClient?.soldeActuel || 0;
  }

  get situationPeriodeLabel(): string {
    const labels: { [k: string]: string } = { jour: "Aujourd'hui", hier: 'Hier', semaine: 'Cette semaine', mois: 'Ce mois', annee: 'Cette année', tout: "Tout l'historique", personnalise: 'Période personnalisée' };
    let label = labels[this.situationPreset] || "Tout l'historique";
    if (this.situationPreset === 'personnalise' && this.situationDateDebut && this.situationDateFin) {
      label += ` (${this.venteService.formatDate(this.situationDateDebut)} - ${this.venteService.formatDate(this.situationDateFin)})`;
    }
    return label;
  }

  getSituationLigneTypeLabel(ligne: ReleveClientLigne): string {
    if (ligne.type === 'VENTE') return 'Vente';
    if (ligne.type === 'RETOUR') return 'Retour';
    return 'Versement';
  }

  getSituationLigneReference(ligne: LigneSituationAffichee): string {
    if (ligne.nbOperations && ligne.nbOperations > 1) return `${ligne.nbOperations} opérations`;
    return ligne.referenceVente || ligne.referenceReglement || '—';
  }

  /** Regroupe les ventes et les versements d'une même date en une seule ligne (montants
   *  additionnés), pour un tableau plus lisible — les retours restent affichés individuellement. */
  private grouperLignesParDate(lignes: ReleveClientLigne[]): LigneSituationAffichee[] {
    const groupes = new Map<string, LigneSituationAffichee>();
    const resultat: LigneSituationAffichee[] = [];

    for (const ligne of lignes) {
      if (ligne.type !== 'VENTE' && ligne.type !== 'VERSEMENT') {
        resultat.push(ligne);
        continue;
      }
      const jour = (ligne.date || '').slice(0, 10);
      const cle = `${jour}_${ligne.type}`;
      const existant = groupes.get(cle);
      if (!existant) {
        const copie: LigneSituationAffichee = { ...ligne, nbOperations: 1 };
        groupes.set(cle, copie);
        resultat.push(copie);
      } else {
        existant.nbOperations = (existant.nbOperations || 1) + 1;
        existant.montantVente = (existant.montantVente || 0) + (ligne.montantVente || 0);
        existant.montantVersement = (existant.montantVersement || 0) + (ligne.montantVersement || 0);
        existant.resteAPayerApres = ligne.resteAPayerApres;
        existant.produitNom = null;
        existant.quantite = null;
        existant.prixUnitaire = null;
        existant.referenceVente = null;
        existant.referenceReglement = null;
        if (existant.utilisateurNom && ligne.utilisateurNom && existant.utilisateurNom !== ligne.utilisateurNom) {
          existant.utilisateurNom = 'Plusieurs';
        }
      }
    }
    return resultat;
  }

  /** Message WhatsApp complet pour la situation d'un client : boutique, client, période, totaux. */
  private whatsAppSituationClient(): { telephone?: string; message: string } | null {
    if (!this.clientPourSituation) return null;
    const client = this.clientPourSituation;
    const boutique = this.boutiqueService.getInfo();
    return {
      telephone: client.numeroTelephone || client.telephone,
      message: formaterMessageWhatsApp({
        boutiqueNom: boutique.nom || 'Ges Boutique',
        boutiqueTelephone: boutique.telephone,
        titreDocument: 'Situation client',
        personneLabel: 'Client',
        personneNom: `${client.nom} ${client.prenom || ''}`.trim(),
        date: new Date().toLocaleDateString('fr-FR'),
        totaux: [
          { label: 'Total des ventes', valeur: this.formatPrice(this.totalVentesSituation) },
          { label: 'Total des versements', valeur: this.formatPrice(this.totalVersementsSituation) },
          { label: 'Solde actuel', valeur: this.formatPrice(this.resteAPayerSituation) }
        ],
        notePied: this.situationPeriodeLabel
      })
    };
  }

  /** Envoi direct par WhatsApp de la situation actuellement affichée (sans passer par l'aperçu PDF). */
  envoyerSituationClientWhatsApp(): void {
    const wa = this.whatsAppSituationClient();
    if (!wa || !envoyerWhatsAppDirect(wa.telephone, wa.message)) {
      Swal.fire({ icon: 'info', title: 'Aucun numéro enregistré', text: 'Ajoutez un numéro de téléphone à ce client pour activer l\'envoi WhatsApp.', timer: 3000, showConfirmButton: false });
    }
  }

  async imprimerSituationClient(): Promise<void> {
    if (!this.clientPourSituation || !this.releveClient) return;
    const client = this.clientPourSituation;

    // L'impression doit couvrir TOUTES les opérations de la période, pas seulement
    // la page actuellement affichée à l'écran (situationLignes est paginé par 20).
    const totalElements = this.releveClient.totalElements || this.situationLignes.length;
    let lignesCompletes = this.situationLignes;
    if (totalElements > this.situationLignes.length && client.id) {
      try {
        const releveComplet = await firstValueFrom(this.venteService.getReleveClient(
          client.id,
          0,
          totalElements,
          this.situationDateDebut || undefined,
          this.situationDateFin || undefined,
          this.situationTypeFilter || undefined
        ));
        lignesCompletes = releveComplet.lignes || lignesCompletes;
      } catch {
        // En cas d'échec, on imprime au moins la page actuellement chargée plutôt que rien.
      }
    }

    // Ventes et versements d'une même date regroupés en une seule ligne (montants additionnés).
    const lignesGroupees = this.grouperLignesParDate(lignesCompletes);

    const lignes = lignesGroupees.map(e => [
      this.formatDate(e.date),
      this.getSituationLigneTypeLabel(e),
      this.getSituationLigneReference(e),
      e.produitNom || '—',
      e.quantite ?? '—',
      e.prixUnitaire ? this.formatPrice(e.prixUnitaire) : '—',
      e.montantVente ? this.formatPrice(e.montantVente) : '—',
      e.montantVersement ? this.formatPrice(e.montantVersement) : '—',
      e.resteAPayerApres !== null && e.resteAPayerApres !== undefined ? this.formatPrice(e.resteAPayerApres) : '—',
      e.utilisateurNom || '—'
    ]);

    this.factureService.ouvrirDocumentPDF({
      titre: 'Situation Client',
      sousTitre: `${client.nom} ${client.prenom || ''} — ${client.numeroTelephone || client.telephone || '—'}`.trim(),
      colonnes: ['Date', 'Type', 'Référence', 'Désignation', 'Qté', 'P.U.', 'Vente', 'Versement', 'Reste à payer', 'Utilisateur'],
      lignes,
      totaux: [
        { label: 'Total des ventes', valeur: this.formatPrice(this.totalVentesSituation) },
        { label: 'Total des versements', valeur: this.formatPrice(this.totalVersementsSituation) },
        { label: 'Solde actuel', valeur: this.formatPrice(this.resteAPayerSituation) }
      ],
      pied: `Période : ${this.situationPeriodeLabel} — ${lignesCompletes.length} opération(s), ${lignes.length} ligne(s)`,
      paysage: true,
      whatsapp: this.whatsAppSituationClient() || undefined
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

  // Fusionné dans la modale unique (onglet "Avances") au lieu d'une fenêtre séparée.
  openHistoriqueAvancesModal(client: Client): void {
    this.selectedClientForVentes = client;
    this.clientDetailTab = 'avances';
    this.showVentesModal = true;
    this.historiqueAvances = null;
    this.chargerHistoriqueAvancesPourOnglet(client);

    // Charge aussi l'onglet Historique en arrière-plan (même logique que loadSituationClient).
    if (this.ventesClient.length === 0) {
      this.isLoadingVentes = true;
      this.venteService.getAllVentes().subscribe({
        next: (ventes) => {
          this.ventesClient = ventes.filter(vente => this.isVenteForClient(vente, client));
          this.ventesClient.sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime());
          this.ventesClientFiltered = [...this.ventesClient];
          this.isLoadingVentes = false;
          this.loadPaiementsForVentesModal(client);
        },
        error: () => { this.isLoadingVentes = false; }
      });
    }
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
