// src/app/views/pages/dettes-anciennes/dettes-anciennes.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DetteAncienneService, DetteAncienne, ReglementDette, DetteAncienneRequest, ReglementDetteRequest } from '../../../shared/services/dette-ancienne.service';
import { ClientService, Client } from '../../../shared/services/client.service';

@Component({
  selector: 'app-dettes-anciennes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dettes-anciennes.component.html',
  styleUrls: ['./dettes-anciennes.component.scss']
})
export class DettesAnciennesComponent implements OnInit {
  // États d'affichage
  vueActuelle: 'liste' | 'nouvelle' | 'reglement' | 'historique' = 'liste';
  
  // Données
  dettes: DetteAncienne[] = [];
  dettesFiltrees: DetteAncienne[] = [];
  clients: Client[] = [];
  detteSelectionnee: DetteAncienne | null = null;
  historiqueReglements: ReglementDette[] = [];
  
  // Filtres
  searchQuery: string = '';
  filtreActif: string = 'nonReglees';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  get paginatedDettes(): DetteAncienne[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.dettesFiltrees.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.dettesFiltrees.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }
  
  // Formulaire nouvelle dette
  detteForm: DetteAncienneRequest = {
    clientId: 0,
    montant: 0,
    dateCredit: new Date().toISOString().split('T')[0],
    description: ''
  };
  clientSearch: string = '';
  filteredClients: Client[] = [];
  showClientDropdown: boolean = false;
  selectedClient: Client | null = null;
  isEditing: boolean = false;
  editingDetteId: number | null = null;
  
  // Formulaire règlement
  reglementForm: ReglementDetteRequest = {
    detteId: 0,
    montantPaye: 0,
    modePaiement: 'ESPECES',
    observations: ''
  };
  modesPaiement = ['ESPECES', 'ORANGE_MONEY', 'MOOV_MONEY', 'CARTE_BANCAIRE', 'VIREMENT', 'CHEQUE'];
  
  // Statistiques
  statistiques: any = {
    totalDettesInitiales: 0,
    totalDettesRestantes: 0,
    totalReglementsEffectues: 0,
    nombreDettesNonReglees: 0,
    nombreDettesReglees: 0,
    totalReglementsDuJour: 0
  };
  
  // États
  loading: boolean = false;
  submitting: boolean = false;

  constructor(
    public detteService: DetteAncienneService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadDettes();
    this.loadStatistiques();
  }

  // ==================== CHARGEMENT DES DONNÉES ====================

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        // Après chargement des clients, enrichir les dettes existantes
        this.enrichirDettesAvecClients();
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur chargement clients: ' + error.message, confirmButtonColor: '#dc3545' });
      }
    });
  }

  loadDettes(): void {
    this.loading = true;
    this.detteService.getDettesNonReglees().subscribe({
      next: (dettes) => {
        this.dettes = dettes;
        this.enrichirDettesAvecClients();
        this.filtrerDettes();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        this.loading = false;
      }
    });
  }

  loadDettesParFiltre(filtre: string): void {
    this.loading = true;
    let observable;
    switch(filtre) {
      case 'nonReglees':
        observable = this.detteService.getDettesNonReglees();
        break;
      case 'reglees':
        observable = this.detteService.getDettesReglees();
        break;
      default:
        observable = this.detteService.getAllDettes();
    }
    observable.subscribe({
      next: (dettes) => {
        this.dettes = dettes;
        this.enrichirDettesAvecClients();
        this.filtrerDettes();
        this.loading = false;
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        this.loading = false;
      }
    });
  }

  loadStatistiques(): void {
    this.detteService.getStatistiquesGlobales().subscribe({
      next: (stats) => {
        this.statistiques = stats;
      },
      error: (error) => console.error('Erreur stats:', error)
    });
  }

  loadHistorique(detteId: number): void {
    this.loading = true;
    this.detteService.getHistoriqueReglements(detteId).subscribe({
      next: (reglements) => {
        this.historiqueReglements = reglements;
        this.loading = false;
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        this.loading = false;
      }
    });
  }

  // ==================== ENRICHISSEMENT DES DONNÉES ====================

  enrichirDettesAvecClients(): void {
    if (!this.clients || this.clients.length === 0) return;
    
    this.dettes = this.dettes.map(dette => {
      if (dette.clientId) {
        const client = this.clients.find(c => c.id === dette.clientId);
        if (client) {
          dette.clientNom = client.nom;
          dette.clientPrenom = client.prenom;
          dette.clientTelephone = client.numeroTelephone;
        }
      }
      return dette;
    });
  }

  // ==================== FILTRES ET RECHERCHE ====================

  onSearchInput(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.filtrerDettes();
  }

  filtrerDettes(): void {
    let resultats = [...this.dettes];
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      resultats = resultats.filter(dette => 
        (this.getClientDisplayName(dette).toLowerCase().includes(query) ||
         this.getClientPhone(dette).toLowerCase().includes(query) ||
         (dette.description && dette.description.toLowerCase().includes(query)))
      );
    }
    switch(this.filtreActif) {
      case 'nonReglees':
        resultats = resultats.filter(d => !d.estReglee);
        break;
      case 'reglees':
        resultats = resultats.filter(d => d.estReglee);
        break;
    }
    this.dettesFiltrees = resultats;
    this.currentPage = 1;
  }

  changerFiltre(filtre: string): void {
    this.filtreActif = filtre;
    this.loadDettesParFiltre(filtre);
  }

  // ==================== CLIENT DISPLAY ====================

  getClientDisplayName(dette: DetteAncienne): string {
    // Si les infos sont déjà dans l'objet dette
    if (dette.clientNom || dette.clientPrenom) {
      return [dette.clientPrenom, dette.clientNom].filter(Boolean).join(' ');
    }
    // Si on a le téléphone
    if (dette.clientTelephone) {
      return dette.clientTelephone;
    }
    // Chercher dans la liste des clients
    if (this.clients && dette.clientId) {
      const client = this.clients.find(c => c.id === dette.clientId);
      if (client) {
        return this.getClientFullName(client);
      }
    }
    return 'Client #' + (dette.clientId || '?');
  }

  getClientPhone(dette: DetteAncienne): string {
    if (dette.clientTelephone) {
      return dette.clientTelephone;
    }
    if (this.clients && dette.clientId) {
      const client = this.clients.find(c => c.id === dette.clientId);
      if (client && client.numeroTelephone) {
        return client.numeroTelephone;
      }
    }
    return '';
  }

  onClientSearch(): void {
    if (this.clientSearch.trim()) {
      const search = this.clientSearch.toLowerCase();
      this.filteredClients = this.clients.filter(client => 
        (client.nom && client.nom.toLowerCase().includes(search)) ||
        (client.prenom && client.prenom.toLowerCase().includes(search)) ||
        (client.numeroTelephone && client.numeroTelephone.includes(search))
      );
    } else {
      this.filteredClients = this.clients;
    }
    this.showClientDropdown = true;
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.detteForm.clientId = client.id!;
    this.clientSearch = this.getClientFullName(client);
    this.showClientDropdown = false;
  }

  getClientFullName(client: Client): string {
    if (!client) return '';
    const nomComplet = [client.prenom, client.nom].filter(Boolean).join(' ');
    return nomComplet || client.numeroTelephone || '';
  }

  // ==================== CRUD DETTES ====================

  creerDette(): void {
    if (!this.detteForm.clientId) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Veuillez sélectionner un client', confirmButtonColor: '#f0ad4e' });
      return;
    }
    if (!this.detteForm.montant || this.detteForm.montant <= 0) {
      Swal.fire({ icon: 'warning', title: 'Montant invalide', text: 'Veuillez saisir un montant valide', confirmButtonColor: '#f0ad4e' });
      return;
    }
    if (!this.detteForm.dateCredit) {
      Swal.fire({ icon: 'warning', title: 'Date manquante', text: 'Veuillez saisir une date', confirmButtonColor: '#f0ad4e' });
      return;
    }

    this.submitting = true;
    this.detteService.creerDette(this.detteForm).subscribe({
      next: () => {
        this.resetFormulaireDette();
        this.vueActuelle = 'liste';
        this.loadDettes();
        this.loadStatistiques();
        this.submitting = false;
        Swal.fire({ icon: 'success', title: 'Succès', text: 'Dette créée avec succès', timer: 2000, timerProgressBar: true, confirmButtonColor: '#198754' });
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        this.submitting = false;
      }
    });
  }

  modifierDette(): void {
    if (!this.editingDetteId) {
      Swal.fire({ icon: 'warning', title: 'Aucune dette', text: 'Aucune dette sélectionnée pour modification', confirmButtonColor: '#f0ad4e' });
      return;
    }
    if (!this.detteForm.montant || this.detteForm.montant <= 0) {
      Swal.fire({ icon: 'warning', title: 'Montant invalide', text: 'Veuillez saisir un montant valide', confirmButtonColor: '#f0ad4e' });
      return;
    }

    this.submitting = true;
    this.detteService.modifierDette(this.editingDetteId, this.detteForm).subscribe({
      next: () => {
        this.resetFormulaireDette();
        this.vueActuelle = 'liste';
        this.loadDettes();
        this.loadStatistiques();
        this.submitting = false;
        Swal.fire({ icon: 'success', title: 'Modifiée', text: 'Dette modifiée avec succès', timer: 2000, timerProgressBar: true, confirmButtonColor: '#198754' });
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        this.submitting = false;
      }
    });
  }

  supprimerDette(id: number): void {
    Swal.fire({
      title: 'Supprimer cette dette ?',
      text: 'Cette action est définitive et ne peut pas être annulée.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.detteService.supprimerDette(id).subscribe({
        next: () => {
          this.loadDettes();
          this.loadStatistiques();
          Swal.fire({ icon: 'success', title: 'Supprimée', text: 'Dette supprimée avec succès', timer: 2000, timerProgressBar: true, confirmButtonColor: '#198754' });
        },
        error: (error) => {
          Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        }
      });
    });
  }

  editerDette(dette: DetteAncienne): void {
    this.detteService.getHistoriqueReglements(dette.id).subscribe({
      next: (reglements) => {
        if (reglements && reglements.length > 0) {
          Swal.fire({ icon: 'warning', title: 'Impossible', text: 'Impossible de modifier une dette qui a déjà des règlements', confirmButtonColor: '#f0ad4e' });
          return;
        }
        
        this.isEditing = true;
        this.editingDetteId = dette.id;
        this.detteForm = {
          clientId: dette.clientId,
          montant: dette.montantInitial,
          dateCredit: dette.dateCredit,
          description: dette.description || ''
        };
        
        // Récupérer les infos du client
        const client = this.clients.find(c => c.id === dette.clientId);
        if (client) {
          this.clientSearch = this.getClientFullName(client);
          this.selectedClient = client;
        }
        
        this.vueActuelle = 'nouvelle';
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
      }
    });
  }

  resetFormulaireDette(): void {
    this.detteForm = {
      clientId: 0,
      montant: 0,
      dateCredit: new Date().toISOString().split('T')[0],
      description: ''
    };
    this.clientSearch = '';
    this.selectedClient = null;
    this.isEditing = false;
    this.editingDetteId = null;
  }

  // ==================== RÈGLEMENTS ====================

  preparerReglement(dette: DetteAncienne): void {
    this.detteSelectionnee = dette;
    this.reglementForm = {
      detteId: dette.id,
      montantPaye: 0,
      modePaiement: 'ESPECES',
      observations: ''
    };
    this.vueActuelle = 'reglement';
  }

  enregistrerReglement(): void {
    if (!this.reglementForm.montantPaye || this.reglementForm.montantPaye <= 0) {
      Swal.fire({ icon: 'warning', title: 'Montant invalide', text: 'Veuillez saisir un montant valide', confirmButtonColor: '#f0ad4e' });
      return;
    }
    if (this.reglementForm.montantPaye > (this.detteSelectionnee?.montantRestant || 0)) {
      Swal.fire({ icon: 'warning', title: 'Montant trop élevé', text: `Le montant ne peut pas dépasser ${this.formatNumber(this.detteSelectionnee?.montantRestant || 0)} F CFA`, confirmButtonColor: '#f0ad4e' });
      return;
    }

    const userId = localStorage.getItem('userId');
    if (userId) {
      this.reglementForm.utilisateurId = parseInt(userId);
    }

    this.submitting = true;
    this.detteService.enregistrerReglement(this.reglementForm).subscribe({
      next: () => {
        this.vueActuelle = 'liste';
        this.loadDettes();
        this.loadStatistiques();
        this.submitting = false;
        Swal.fire({ icon: 'success', title: 'Règlement enregistré', text: 'Le paiement a été enregistré avec succès', timer: 2500, timerProgressBar: true, confirmButtonColor: '#198754' });
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message, confirmButtonColor: '#dc3545' });
        this.submitting = false;
      }
    });
  }

  // ==================== HISTORIQUE ====================

  voirHistorique(dette: DetteAncienne): void {
    this.detteSelectionnee = dette;
    this.loadHistorique(dette.id);
    this.vueActuelle = 'historique';
  }

  getTotalPayeHistorique(): number {
    return this.historiqueReglements.reduce((total, reg) => total + (reg.montantPaye || 0), 0);
  }

  // ==================== UTILITAIRES ====================

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatDecimal(value: number): string {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getTotalRestant(): number {
    return this.dettesFiltrees.reduce((total, dette) => total + (dette.montantRestant || 0), 0);
  }

  getTotalInitial(): number {
    return this.dettesFiltrees.reduce((total, dette) => total + (dette.montantInitial || 0), 0);
  }

  getPourcentageGlobal(): number {
    const total = this.getTotalInitial();
    if (total === 0) return 0;
    const paye = total - this.getTotalRestant();
    return (paye / total) * 100;
  }

  annuler(): void {
    this.vueActuelle = 'liste';
    this.resetFormulaireDette();
  }

  refresh(): void {
    this.loadDettes();
    this.loadStatistiques();
  }

  openNouvelleDette(): void {
    this.resetFormulaireDette();
    this.vueActuelle = 'nouvelle';
  }
}