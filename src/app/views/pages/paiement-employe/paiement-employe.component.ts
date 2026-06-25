import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeService, Employe } from '../../../shared/services/employe.service';
import { PaiementEmployeService, PaiementEmploye, PaiementEmployeRequest, StatsPaiementEmploye } from '../../../shared/services/paiement-employe.service';
import { AuthService } from '../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

@Component({
  selector: 'app-paiement-employe',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './paiement-employe.component.html',
  styleUrls: ['./paiement-employe.component.scss']
})
export class PaiementEmployeComponent implements OnInit {

  employes: Employe[] = [];
  paiements: PaiementEmploye[] = [];
  stats: StatsPaiementEmploye = { totalPaiements: 0, totalPaies: 0, totalAnnules: 0, montantTotalPaye: 0 };

  isLoading = false;
  isSaving = false;
  showFormModal = false;

  // Filtres
  filtreStatut = '';
  filtreEmployeId: number | string = '';
  searchQuery = '';

  // Formulaire de paiement
  form: PaiementEmployeRequest = {
    employeId: 0,
    nombreMois: 1,
    periodeDebut: '',
    periodeFin: '',
    observation: '',
    utilisateurId: undefined
  };

  moisOptions: string[] = [];
  anneeOptions: number[] = [];
  selectedMoisDebut = '';
  selectedAnneeDebut = new Date().getFullYear();
  selectedMoisFin = '';
  selectedAnneeFin = new Date().getFullYear();

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  get paiementsFiltres(): PaiementEmploye[] {
    let liste = this.paiements;
    if (this.filtreStatut) liste = liste.filter(p => p.statut === this.filtreStatut);
    if (this.filtreEmployeId !== '' && this.filtreEmployeId !== null) liste = liste.filter(p => p.employeId === this.filtreEmployeId);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      liste = liste.filter(p => p.employeNomComplet.toLowerCase().includes(q) || p.periodeDebut.toLowerCase().includes(q));
    }
    return liste;
  }

  get paginatedPaiements(): PaiementEmploye[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.paiementsFiltres.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.paiementsFiltres.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  get employeSelectionne(): Employe | undefined {
    return this.employes.find(e => e.id === this.form.employeId);
  }

  get montantCalcule(): number {
    if (!this.employeSelectionne) return 0;
    return this.employeSelectionne.salaireMensuel * this.form.nombreMois;
  }

  constructor(
    private employeService: EmployeService,
    private paiementService: PaiementEmployeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.genererOptions();
    this.chargerDonnees();
  }

  genererOptions(): void {
    this.moisOptions = MOIS_LABELS;
    const anneeActuelle = new Date().getFullYear();
    this.anneeOptions = Array.from({ length: 5 }, (_, i) => anneeActuelle - 2 + i);
    const moisActuel = MOIS_LABELS[new Date().getMonth()];
    this.selectedMoisDebut = moisActuel;
    this.selectedMoisFin = moisActuel;
  }

  chargerDonnees(): void {
    this.isLoading = true;
    this.employeService.getActifs().subscribe({
      next: d => this.employes = d,
      error: () => Swal.fire({ icon: 'warning', title: 'Attention', text: 'Impossible de charger la liste des employés.', confirmButtonColor: '#3085d6' })
    });
    this.paiementService.getTous().subscribe({
      next: d => { this.paiements = d; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
    this.paiementService.getStatistiques().subscribe({
      next: s => this.stats = s,
      error: () => {}
    });
  }

  ouvrirFormPaiement(): void {
    const user = this.authService.getUser?.();
    this.form = {
      employeId: 0,
      nombreMois: 1,
      periodeDebut: '',
      periodeFin: '',
      observation: '',
      utilisateurId: user?.id
    };
    this.showFormModal = true;
  }

  fermerModal(): void { this.showFormModal = false; }

  getPeriodeDebut(): string {
    return `${this.selectedMoisDebut} ${this.selectedAnneeDebut}`;
  }

  getPeriodeFin(): string {
    if (this.form.nombreMois <= 1) return this.getPeriodeDebut();
    return `${this.selectedMoisFin} ${this.selectedAnneeFin}`;
  }

  confirmerPaiement(): void {
    if (!this.form.employeId || this.form.employeId === 0) {
      Swal.fire({ icon: 'warning', title: 'Employé requis', text: 'Veuillez sélectionner un employé.', confirmButtonColor: '#3085d6' });
      return;
    }
    if (!this.selectedMoisDebut) {
      Swal.fire({ icon: 'warning', title: 'Période requise', text: 'Veuillez choisir une période.', confirmButtonColor: '#3085d6' });
      return;
    }

    const employe = this.employeSelectionne!;
    const periodeDebut = this.getPeriodeDebut();
    const periodeFin = this.getPeriodeFin();
    const montant = this.montantCalcule;
    const periodeLabel = this.form.nombreMois > 1 ? `${periodeDebut} à ${periodeFin}` : periodeDebut;

    Swal.fire({
      title: 'Confirmer le paiement ?',
      html: `
        <div class="text-left">
          <p><strong>Employé :</strong> ${employe.nomComplet}</p>
          <p><strong>Poste :</strong> ${employe.poste}</p>
          <p><strong>Période :</strong> ${periodeLabel}</p>
          <p><strong>Nombre de mois :</strong> ${this.form.nombreMois}</p>
          <p><strong>Montant total :</strong> <span class="text-danger font-weight-bold">${this.formatMontant(montant)}</span></p>
          <p class="text-muted small">Ce montant sera débité de la caisse.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, payer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.form.periodeDebut = periodeDebut;
        this.form.periodeFin = this.form.nombreMois > 1 ? periodeFin : periodeDebut;
        this.effectuerPaiement();
      }
    });
  }

  private effectuerPaiement(): void {
    this.isSaving = true;
    this.paiementService.payer(this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.showFormModal = false;
        this.chargerDonnees();
        Swal.fire({ icon: 'success', title: 'Paiement effectué !', text: 'Le salaire a été payé avec succès.', timer: 2500, showConfirmButton: false });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Une erreur est survenue.', confirmButtonColor: '#d33' });
      }
    });
  }

  confirmerAnnulation(paiement: PaiementEmploye): void {
    Swal.fire({
      title: 'Annuler ce paiement ?',
      html: `
        <div class="text-left">
          <p><strong>Employé :</strong> ${paiement.employeNomComplet}</p>
          <p><strong>Période :</strong> ${paiement.periodeDebut}${paiement.periodeFin && paiement.periodeFin !== paiement.periodeDebut ? ' à ' + paiement.periodeFin : ''}</p>
          <p><strong>Montant :</strong> <span class="text-danger font-weight-bold">${this.formatMontant(paiement.montant)}</span></p>
          <p class="text-warning"><i class="fas fa-exclamation-triangle"></i> Ce montant sera recrédité dans la caisse.</p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Motif d\'annulation (obligatoire)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, annuler le paiement',
      cancelButtonText: 'Non',
      preConfirm: (motif) => {
        if (!motif || motif.trim() === '') {
          Swal.showValidationMessage('Le motif d\'annulation est obligatoire');
        }
        return motif;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const user = this.authService.getUser?.();
        this.paiementService.annuler(paiement.id, result.value, user?.id).subscribe({
          next: () => {
            this.chargerDonnees();
            Swal.fire({ icon: 'success', title: 'Paiement annulé', text: 'Le montant a été recrédité en caisse.', timer: 2500, showConfirmButton: false });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Erreur lors de l\'annulation.', confirmButtonColor: '#d33' })
        });
      }
    });
  }

  formatMontant(m: number): string {
    return new Intl.NumberFormat('fr-FR').format(m) + ' FCFA';
  }
}
