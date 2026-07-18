// src/app/views/pages/parametres/parametres.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../shared/services/auth.service';
import { ParametresService, ParametresSelection, ParametresStatut } from '../../../shared/services/parametres.service';

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class ParametresComponent implements OnInit {

  // ==================== ÉTATS ====================
  isLoading: boolean = false;
  isLoadingStatut: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // ==================== STATUT BACKEND (compteurs) ====================
  statut: ParametresStatut = {
    soldeCaisse: 0,
    nombreOperationsCaisse: 0,
    nombreCreditsRegles: 0,
    nombreVentesAnnulees: 0
  };
  statut_erreur: boolean = false;

  // ==================== ENDPOINTS DISPONIBLES ====================
  endpointsDisponibles: boolean = true;

  // ==================== SÉLECTIONS ====================
  selectionSoldeCaisse: boolean = false;
  selectionHistoriqueCaisse: boolean = false;
  selectionCreditsRegles: boolean = false;
  selectionVentesAnnulees: boolean = false;

  // ==================== CONFIRMATION SUPPRESSION ====================
  texteConfirmation: string = '';
  showConfirmDelete: boolean = false;

  constructor(
    private authService: AuthService,
    private parametresService: ParametresService
  ) {}

  ngOnInit(): void {
    this.chargerStatut();
  }

  // ==================== CHARGEMENT STATUT ====================

  chargerStatut(): void {
    this.isLoadingStatut = true;
    this.statut_erreur = false;
    this.parametresService.getStatut().subscribe({
      next: (data) => {
        this.statut = {
          soldeCaisse: data?.soldeCaisse ?? 0,
          nombreOperationsCaisse: data?.nombreOperationsCaisse ?? 0,
          nombreCreditsRegles: data?.nombreCreditsRegles ?? 0,
          nombreVentesAnnulees: data?.nombreVentesAnnulees ?? 0
        };
        this.isLoadingStatut = false;
      },
      error: () => {
        this.isLoadingStatut = false;
        this.statut_erreur = true;
      }
    });
  }

  // ==================== ACCESSEURS RÔLE ====================

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // ==================== SÉLECTION ====================

  toutSelectionner(): void {
    const etat = !(this.selectionSoldeCaisse && this.selectionHistoriqueCaisse &&
                   this.selectionCreditsRegles && this.selectionVentesAnnulees);
    this.selectionSoldeCaisse = etat;
    this.selectionHistoriqueCaisse = etat;
    this.selectionCreditsRegles = etat;
    this.selectionVentesAnnulees = etat;
  }

  get toutEstSelectionne(): boolean {
    return this.selectionSoldeCaisse && this.selectionHistoriqueCaisse &&
           this.selectionCreditsRegles && this.selectionVentesAnnulees;
  }

  get aucuneSelection(): boolean {
    return !this.selectionSoldeCaisse && !this.selectionHistoriqueCaisse &&
           !this.selectionCreditsRegles && !this.selectionVentesAnnulees;
  }

  get selectionResume(): string {
    const elements: string[] = [];
    if (this.selectionSoldeCaisse) elements.push('Solde caisse');
    if (this.selectionHistoriqueCaisse) elements.push('Historique caisse');
    if (this.selectionCreditsRegles) elements.push('Crédits réglés');
    if (this.selectionVentesAnnulees) elements.push('Ventes annulées');
    return elements.join(', ');
  }

  // ==================== PAYLOAD SÉLECTION ====================

  private buildSelection(): ParametresSelection {
    return {
      soldeCaisse: this.selectionSoldeCaisse,
      historiqueOperationsCaisse: this.selectionHistoriqueCaisse,
      creditsRegles: this.selectionCreditsRegles,
      historiqueVentesAnnulees: this.selectionVentesAnnulees
    };
  }

  // ==================== FORMATAGE ====================

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(montant || 0);
  }

  // ==================== RÉINITIALISATION ====================

  reinitialiser(): void {
    if (this.aucuneSelection) {
      this.errorMessage = 'Veuillez sélectionner au moins un élément à réinitialiser.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    const ok = confirm(
      `Êtes-vous sûr de vouloir réinitialiser les éléments sélectionnés ?\n\n${this.selectionResume}`
    );
    if (!ok) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.parametresService.reinitialiser(this.buildSelection()).subscribe({
      next: () => {
        this.successMessage = 'Réinitialisation effectuée avec succès.';
        this.isLoading = false;
        this.reinitialiserSelections();
        this.chargerStatut();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de la réinitialisation.';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ==================== SUPPRESSION ====================

  ouvrirConfirmationSuppression(): void {
    if (this.aucuneSelection) {
      this.errorMessage = 'Veuillez sélectionner au moins un élément à supprimer.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    const ok = confirm(
      `ATTENTION : Cette action est irréversible !\n\nVous allez supprimer définitivement :\n${this.selectionResume}\n\nContinuer ?`
    );
    if (!ok) return;

    this.texteConfirmation = '';
    this.showConfirmDelete = true;
  }

  confirmerSuppression(): void {
    if (this.texteConfirmation.trim() !== 'CONFIRMER') {
      this.errorMessage = 'Vous devez taper exactement "CONFIRMER" pour valider.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

    this.showConfirmDelete = false;
    this.isLoading = true;
    this.errorMessage = '';

    this.parametresService.supprimer(this.buildSelection()).subscribe({
      next: () => {
        this.successMessage = 'Suppression définitive effectuée avec succès.';
        this.isLoading = false;
        this.reinitialiserSelections();
        this.chargerStatut();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de la suppression.';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  annulerSuppression(): void {
    this.showConfirmDelete = false;
    this.texteConfirmation = '';
  }

  // ==================== UTILITAIRES ====================

  private reinitialiserSelections(): void {
    this.selectionSoldeCaisse = false;
    this.selectionHistoriqueCaisse = false;
    this.selectionCreditsRegles = false;
    this.selectionVentesAnnulees = false;
  }
}
