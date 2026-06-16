import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DepotGardeService,
  DepotGarde,
  DepotGardeRequest,
  DepotClient,
  DepotClientRequest,
  RetraitDepotRequest,
  StatsDepotGarde,
  ClientDepotGroupe,
  RetraitGlobalRequest
} from '../../../shared/services/depot-garde.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-depot-garde',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depot-garde.component.html',
  styleUrls: ['./depot-garde.component.scss']
})
export class DepotGardeComponent implements OnInit {

  depots: DepotGarde[] = [];
  stats: StatsDepotGarde = { totalDepots: 0, totalActifs: 0, totalClotures: 0, totalMontantGarde: 0, totalMontantInitial: 0 };

  isLoading = false;
  isSaving = false;

  vueMode: 'liste' | 'groupes' = 'liste';
  groupesClient: ClientDepotGroupe[] = [];
  isLoadingGroupes = false;

  showFormModal = false;
  isEditing = false;
  selectedDepot: DepotGarde | null = null;

  showDetailModal = false;
  depotDetail: DepotGarde | null = null;

  showRetraitModal = false;
  depotRetrait: DepotGarde | null = null;

  showRetraitGlobalModal = false;
  clientRetraitGlobal: ClientDepotGroupe | null = null;
  retraitGlobalForm: RetraitGlobalRequest = { numero: '', montant: 0, observation: '' };

  filtreStatut = '';
  searchQuery = '';

  currentPage = 1;
  itemsPerPage = 10;

  form: DepotGardeRequest = { nom: '', prenom: '', numero: '', montant: 0, observation: '' };
  retraitForm: RetraitDepotRequest = { montant: 0, observation: '' };

  // Clients dépôt
  depotClients: DepotClient[] = [];
  depotClientSearch = '';
  filteredDepotClients: DepotClient[] = [];
  selectedDepotClient: DepotClient | null = null;
  showNewDepotClientForm = false;
  depotClientForm: DepotClientRequest = { nom: '', prenom: '', numero: '' };

  get depotsFiltres(): DepotGarde[] {
    let liste = this.depots;
    if (this.filtreStatut) liste = liste.filter(d => d.statut === this.filtreStatut);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      liste = liste.filter(d =>
        d.nomComplet.toLowerCase().includes(q) ||
        d.numero.includes(q)
      );
    }
    return liste;
  }

  get paginatedDepots(): DepotGarde[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.depotsFiltres.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.depotsFiltres.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  constructor(private depotService: DepotGardeService) {}

  ngOnInit(): void {
    this.chargerDonnees();
    this.depotService.getTousClients().subscribe(c => this.depotClients = c);
  }

  chargerDonnees(): void {
    this.isLoading = true;
    this.depotService.getTous().subscribe({
      next: d => { this.depots = d; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
    this.depotService.getStatistiques().subscribe({
      next: s => this.stats = s,
      error: () => {}
    });
  }

  basculerVue(mode: 'liste' | 'groupes'): void {
    this.vueMode = mode;
    if (mode === 'groupes' && this.groupesClient.length === 0) {
      this.chargerGroupes();
    }
  }

  chargerGroupes(): void {
    this.isLoadingGroupes = true;
    this.depotService.getGroupesClient().subscribe({
      next: g => { this.groupesClient = g; this.isLoadingGroupes = false; },
      error: () => { this.isLoadingGroupes = false; }
    });
  }

  ouvrirRetraitGlobal(client: ClientDepotGroupe): void {
    this.clientRetraitGlobal = client;
    this.retraitGlobalForm = { numero: client.numero, montant: 0, observation: '' };
    this.showRetraitGlobalModal = true;
  }

  confirmerRetraitGlobal(): void {
    if (!this.clientRetraitGlobal) return;
    const total = this.clientRetraitGlobal.totalMontantRestant;
    const montant = this.retraitGlobalForm.montant || 0;

    if (montant > 0 && montant > total) {
      Swal.fire({ icon: 'warning', title: 'Solde insuffisant', text: `Total disponible : ${this.formatMontant(total)}`, confirmButtonColor: '#3085d6' });
      return;
    }

    const montantAffiche = montant > 0 ? this.formatMontant(montant) : this.formatMontant(total) + ' (total)';
    const client = this.clientRetraitGlobal;

    Swal.fire({
      title: 'Confirmer le retrait global ?',
      html: `
        <p><strong>Client :</strong> ${client.nomComplet}</p>
        <p><strong>Numéro :</strong> ${client.numero}</p>
        <p><strong>Montant retiré :</strong> <span class="text-danger font-weight-bold">${montantAffiche}</span></p>
        <p><strong>Nombre de dépôts touchés :</strong> ${client.nombreDepotsActifs}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        const payload: RetraitGlobalRequest = {
          numero: client.numero,
          montant: montant > 0 ? montant : undefined,
          observation: this.retraitGlobalForm.observation
        };
        this.depotService.retraitGlobal(payload).subscribe({
          next: () => {
            this.showRetraitGlobalModal = false;
            this.clientRetraitGlobal = null;
            this.groupesClient = [];
            this.chargerDonnees();
            this.chargerGroupes();
            Swal.fire({ icon: 'success', title: 'Retrait global effectué !', text: `${montantAffiche} retirés.`, timer: 2500, showConfirmButton: false });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Erreur lors du retrait.', confirmButtonColor: '#d33' })
        });
      }
    });
  }

  ouvrirFormCreation(): void {
    this.isEditing = false;
    this.selectedDepot = null;
    this.form = { nom: '', prenom: '', numero: '', montant: 0, observation: '' };
    this.selectedDepotClient = null;
    this.depotClientSearch = '';
    this.filteredDepotClients = [];
    this.showNewDepotClientForm = false;
    this.depotClientForm = { nom: '', prenom: '', numero: '' };
    this.showFormModal = true;
  }

  searchDepotClients(): void {
    const q = this.depotClientSearch.trim().toLowerCase();
    if (!q) { this.filteredDepotClients = []; return; }
    this.filteredDepotClients = this.depotClients.filter(c =>
      c.nomComplet.toLowerCase().includes(q) || c.numero.includes(q)
    );
  }

  selectDepotClient(client: DepotClient): void {
    this.selectedDepotClient = client;
    this.form.depotClientId = client.id;
    this.depotClientSearch = client.nomComplet;
    this.filteredDepotClients = [];
    this.showNewDepotClientForm = false;
  }

  clearDepotClient(): void {
    this.selectedDepotClient = null;
    this.form.depotClientId = undefined;
    this.depotClientSearch = '';
    this.filteredDepotClients = [];
  }

  saveNewDepotClient(): void {
    if (!this.depotClientForm.nom.trim()) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Le nom est obligatoire.', confirmButtonColor: '#3085d6' });
      return;
    }
    if (!this.depotClientForm.numero.trim()) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Le téléphone est obligatoire.', confirmButtonColor: '#3085d6' });
      return;
    }
    this.depotService.creerClient(this.depotClientForm).subscribe({
      next: (client) => {
        this.depotClients.push(client);
        this.selectDepotClient(client);
        this.showNewDepotClientForm = false;
        this.depotClientForm = { nom: '', prenom: '', numero: '' };
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Création impossible.', confirmButtonColor: '#d33' })
    });
  }

  ouvrirFormEdition(depot: DepotGarde): void {
    this.isEditing = true;
    this.selectedDepot = depot;
    this.form = {
      nom: depot.nom,
      prenom: depot.prenom || '',
      numero: depot.numero,
      montant: depot.montantInitial,
      observation: depot.observation || ''
    };
    this.showFormModal = true;
  }

  fermerModal(): void {
    this.showFormModal = false;
    this.showDetailModal = false;
    this.showRetraitModal = false;
    this.showRetraitGlobalModal = false;
  }

  voirDetail(depot: DepotGarde): void {
    this.depotService.getById(depot.id).subscribe({
      next: d => { this.depotDetail = d; this.showDetailModal = true; },
      error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les détails.', confirmButtonColor: '#d33' })
    });
  }

  ouvrirRetrait(depot: DepotGarde): void {
    this.depotRetrait = depot;
    this.retraitForm = { montant: 0, observation: '' };
    this.showRetraitModal = true;
  }

  enregistrer(): void {
    if (!this.isEditing && !this.form.depotClientId) {
      if (!this.form.nom?.trim()) {
        Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Sélectionnez un client ou saisissez un nom.', confirmButtonColor: '#3085d6' });
        return;
      }
      if (!this.form.numero?.trim()) {
        Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Le numéro de téléphone est obligatoire.', confirmButtonColor: '#3085d6' });
        return;
      }
    }
    if (this.isEditing && !this.form.nom?.trim()) {
      Swal.fire({ icon: 'warning', title: 'Champ requis', text: 'Le nom est obligatoire.', confirmButtonColor: '#3085d6' });
      return;
    }
    if (!this.isEditing && (!this.form.montant || this.form.montant <= 0)) {
      Swal.fire({ icon: 'warning', title: 'Montant invalide', text: 'Le montant doit être supérieur à 0.', confirmButtonColor: '#3085d6' });
      return;
    }

    this.isSaving = true;
    const action = this.isEditing && this.selectedDepot
      ? this.depotService.modifier(this.selectedDepot.id, this.form)
      : this.depotService.creer(this.form);

    action.subscribe({
      next: () => {
        this.isSaving = false;
        this.showFormModal = false;
        this.chargerDonnees();
        Swal.fire({
          icon: 'success',
          title: this.isEditing ? 'Dépôt modifié !' : 'Dépôt enregistré !',
          text: this.isEditing ? 'Les informations ont été mises à jour.' : 'Le dépôt a été créé avec succès.',
          timer: 2500, showConfirmButton: false
        });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Une erreur est survenue.', confirmButtonColor: '#d33' });
      }
    });
  }

  confirmerRetrait(): void {
    if (!this.depotRetrait) return;
    if (!this.retraitForm.montant || this.retraitForm.montant <= 0) {
      Swal.fire({ icon: 'warning', title: 'Montant invalide', text: 'Le montant doit être supérieur à 0.', confirmButtonColor: '#3085d6' });
      return;
    }
    if (this.retraitForm.montant > this.depotRetrait.montantRestant) {
      Swal.fire({
        icon: 'warning', title: 'Solde insuffisant',
        text: `Le solde disponible est de ${this.formatMontant(this.depotRetrait.montantRestant)}.`,
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const depot = this.depotRetrait;
    const estTotal = this.retraitForm.montant === depot.montantRestant;

    Swal.fire({
      title: 'Confirmer le retrait ?',
      html: `
        <div class="text-left">
          <p><strong>Client :</strong> ${depot.nomComplet}</p>
          <p><strong>Montant retiré :</strong> <span class="text-danger font-weight-bold">${this.formatMontant(this.retraitForm.montant)}</span></p>
          <p><strong>Solde restant :</strong> ${this.formatMontant(depot.montantRestant - this.retraitForm.montant)}</p>
          ${estTotal ? '<p class="text-warning"><i class="fas fa-exclamation-triangle"></i> Ce retrait clôturera le dépôt (solde = 0).</p>' : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.depotService.effectuerRetrait(depot.id, this.retraitForm).subscribe({
          next: () => {
            this.showRetraitModal = false;
            this.chargerDonnees();
            Swal.fire({ icon: 'success', title: 'Retrait effectué !', text: 'Le retrait a été enregistré.', timer: 2500, showConfirmButton: false });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Erreur lors du retrait.', confirmButtonColor: '#d33' })
        });
      }
    });
  }

  confirmerCloture(depot: DepotGarde): void {
    Swal.fire({
      title: 'Clôturer ce dépôt ?',
      html: `
        <p><strong>${depot.nomComplet}</strong></p>
        <p>Solde restant : <strong class="text-danger">${this.formatMontant(depot.montantRestant)}</strong></p>
        <p class="text-muted small">Le dépôt sera marqué comme clôturé.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, clôturer',
      cancelButtonText: 'Non'
    }).then(result => {
      if (result.isConfirmed) {
        this.depotService.cloturer(depot.id).subscribe({
          next: () => {
            this.chargerDonnees();
            Swal.fire({ icon: 'success', title: 'Dépôt clôturé', timer: 2000, showConfirmButton: false });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Erreur lors de la clôture.', confirmButtonColor: '#d33' })
        });
      }
    });
  }

  formatMontant(m: number): string {
    return new Intl.NumberFormat('fr-FR').format(m) + ' FCFA';
  }

  getPourcentageRetire(depot: DepotGarde): number {
    if (!depot.montantInitial) return 0;
    return Math.round((depot.montantRetire / depot.montantInitial) * 100);
  }
}
